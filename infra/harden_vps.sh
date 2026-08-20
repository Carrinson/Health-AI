#!/usr/bin/env bash
# VPS hardening — run ONCE as root on a fresh Ubuntu 24.04 box.
#
# Usage:
#   1. Copy this file to the server:  scp harden_vps.sh root@YOUR_IP:/root/
#   2. On the server:                 bash harden_vps.sh yourusername
#
# What it does and why:
#   - Creates a non-root sudo user. Running everything as root means any
#     compromised process owns the whole machine.
#   - Copies your SSH key to that user so you can still get in afterwards.
#   - Disables root login and password authentication. Password login on a
#     public IP gets brute-forced within hours — this is not hypothetical.
#   - Firewall: only 22 (SSH), 80 (HTTP), 443 (HTTPS). Postgres, Redis and
#     Ollama stay on the internal Docker network, never exposed.
#   - fail2ban bans IPs that fail repeatedly.
#   - Swap: 4GB. On an 8GB box the LLM will need headroom or the kernel
#     OOM-kills your API at the worst possible moment.
#   - Docker + Compose plugin.
#
# IMPORTANT: do NOT close your current SSH session after running this.
# Open a SECOND terminal and confirm you can log in as the new user first.
# If you lock yourself out, you need the provider's web console to recover.

set -euo pipefail

USERNAME="${1:-}"
if [[ -z "$USERNAME" ]]; then
  echo "Usage: bash harden_vps.sh <username>"; exit 1
fi

echo "==> Updating packages"
apt-get update -qq && apt-get upgrade -y -qq

echo "==> Creating user '$USERNAME'"
if ! id "$USERNAME" &>/dev/null; then
  adduser --disabled-password --gecos "" "$USERNAME"
  usermod -aG sudo "$USERNAME"
  echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/90-$USERNAME"
  chmod 440 "/etc/sudoers.d/90-$USERNAME"
fi

echo "==> Copying SSH keys to '$USERNAME'"
mkdir -p "/home/$USERNAME/.ssh"
if [[ -f /root/.ssh/authorized_keys ]]; then
  cp /root/.ssh/authorized_keys "/home/$USERNAME/.ssh/"
else
  echo "!! No /root/.ssh/authorized_keys found."
  echo "!! Paste your PUBLIC key now (one line, starts with ssh-ed25519 or ssh-rsa):"
  read -r PUBKEY
  echo "$PUBKEY" > "/home/$USERNAME/.ssh/authorized_keys"
fi
chown -R "$USERNAME:$USERNAME" "/home/$USERNAME/.ssh"
chmod 700 "/home/$USERNAME/.ssh"
chmod 600 "/home/$USERNAME/.ssh/authorized_keys"

echo "==> Hardening sshd"
cat > /etc/ssh/sshd_config.d/99-hardening.conf << 'SSHEOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
MaxAuthTries 3
SSHEOF
sshd -t && systemctl restart ssh

echo "==> Firewall"
apt-get install -y -qq ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> fail2ban"
apt-get install -y -qq fail2ban
systemctl enable --now fail2ban

echo "==> Swap (4GB)"
if [[ ! -f /swapfile ]]; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

echo "==> Docker"
if ! command -v docker &>/dev/null; then
  apt-get install -y -qq ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
usermod -aG docker "$USERNAME"
systemctl enable --now docker

echo "==> Unattended security updates"
apt-get install -y -qq unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

echo ""
echo "=============================================="
echo " DONE. Before closing this session:"
echo " Open a NEW terminal and run:"
echo "   ssh $USERNAME@$(curl -s -4 icanhazip.com 2>/dev/null || echo YOUR_IP)"
echo " Only close this one once that works."
echo "=============================================="
free -h

# CredInvoice - Oracle Cloud Deployment Handbook

> Complete guide to deploying CredInvoice Supply Chain Finance Platform on Oracle Cloud Free Tier

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Cost Summary](#cost-summary)
3. [Prerequisites](#prerequisites)
4. [Oracle Cloud Setup](#oracle-cloud-setup)
5. [Server Configuration](#server-configuration)
6. [Application Deployment](#application-deployment)
7. [Database Migration](#database-migration)
8. [Nginx Configuration](#nginx-configuration)
9. [SSL Certificate Setup](#ssl-certificate-setup)
10. [Useful Commands](#useful-commands)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance & Updates](#maintenance--updates)

---

## Architecture Overview

```mermaid
flowchart TB
    subgraph Internet
        User[👤 User Browser]
    end
    
    subgraph OracleCloud[Oracle Cloud Free Tier]
        subgraph VM[VM.Standard.E2.1.Micro - 1GB RAM + 2GB Swap]
            Nginx[Nginx :80/:443]
            
            subgraph Frontend[Frontend]
                React[React Static Files<br/>/home/ubuntu/Credinvoice-main/frontend/dist]
            end
            
            subgraph Backend[Backend]
                Node[Node.js + Express<br/>PM2 Managed<br/>Port 3000]
            end
            
            subgraph Database[Database]
                PostgreSQL[(PostgreSQL<br/>Port 5432)]
            end
        end
    end
    
    User -->|HTTP/HTTPS| Nginx
    Nginx -->|Static Files /| React
    Nginx -->|Proxy /api/| Node
    Node -->|Prisma ORM| PostgreSQL
```

### Request Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant N as Nginx
    participant R as React (Static)
    participant A as Node.js API
    participant D as PostgreSQL
    
    U->>N: GET http://your-ip/
    N->>R: Serve index.html
    R-->>U: React App
    
    U->>N: POST /api/auth/login
    N->>A: Proxy to :3000
    A->>D: Query user
    D-->>A: User data
    A-->>N: JWT Token
    N-->>U: Response
```

### Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | 20.x |
| **Backend Framework** | Express.js | 4.x |
| **Language** | TypeScript | 5.x |
| **Frontend Framework** | React | 18.x |
| **Build Tool** | Vite | 5.x |
| **CSS Framework** | Tailwind CSS | 3.x |
| **Database** | PostgreSQL | 14.x |
| **ORM** | Prisma | 5.x |
| **Process Manager** | PM2 | Latest |
| **Web Server** | Nginx | 1.18 |
| **OS** | Ubuntu | 22.04 LTS |

---

## Cost Summary

| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| Compute (AMD) | VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM) | **$0** |
| Boot Volume | 46.6 GB | **$0** |
| VCN & Networking | Public IP, Internet Gateway | **$0** |
| Outbound Data | Up to 10 TB/month | **$0** |
| **Total** | | **$0/month** |

> **Note:** Oracle Cloud Always Free tier includes 2 AMD Micro instances. ARM-based instances (VM.Standard.A1.Flex) offer more resources (4 OCPU, 24GB RAM) but may have availability issues.

---

## Prerequisites

- [ ] Oracle Cloud Account (Free Tier) - [Sign up here](https://www.oracle.com/cloud/free/)
- [ ] SSH Client (PowerShell on Windows, Terminal on Mac/Linux)
- [ ] Project source code (zip file)
- [ ] Basic knowledge of command line

---

## Oracle Cloud Setup

### Network Architecture

```mermaid
flowchart TB
    subgraph VCN[credinvoice-vcn - 10.0.0.0/16]
        subgraph PublicSubnet[credinvoice-public-subnet - 10.0.0.0/24]
            VM[Compute Instance<br/>YOUR_PUBLIC_IP]
        end
        IGW[Internet Gateway<br/>credinvoice-igw]
        RT[Route Table<br/>0.0.0.0/0 → IGW]
        SL[Security List<br/>Ports: 22, 80, 443]
    end
    
    Internet((Internet)) <-->|Traffic| IGW
    IGW <--> PublicSubnet
    RT -.->|Routes| PublicSubnet
    SL -.->|Rules| PublicSubnet
```

### Step 1: Create Virtual Cloud Network (VCN)

1. Log into [Oracle Cloud Console](https://cloud.oracle.com)
2. Navigate to **☰ Menu → Networking → Virtual Cloud Networks**
3. Click **Create VCN**
4. Configure:
   - **Name:** `credinvoice-vcn`
   - **Compartment:** Your root compartment
   - **IPv4 CIDR Block:** `10.0.0.0/16`
5. Click **Create VCN**

### Step 2: Create Internet Gateway

1. In your VCN, click **Gateways** tab
2. Click **Create Internet Gateway**
3. Configure:
   - **Name:** `credinvoice-igw`
4. Click **Create Internet Gateway**

### Step 3: Create Public Subnet

1. Click **Subnets** tab
2. Click **Create Subnet**
3. Configure:
   - **Name:** `credinvoice-public-subnet`
   - **Subnet Type:** Regional
   - **CIDR Block:** `10.0.0.0/24`
   - **Route Table:** Default Route Table
   - **Subnet Access:** **Public Subnet**
   - **Security List:** Default Security List
4. Click **Create Subnet**

### Step 4: Configure Route Table

1. Click **Routing** tab
2. Click **Default Route Table for credinvoice-vcn**
3. Click **Add Route Rules**
4. Configure:
   - **Target Type:** Internet Gateway
   - **Destination CIDR Block:** `0.0.0.0/0`
   - **Target:** `credinvoice-igw`
5. Click **Add Route Rules**

### Step 5: Configure Security List (Firewall Rules)

1. Click **Security** tab
2. Click **Default Security List for credinvoice-vcn**
3. Click **Add Ingress Rules**
4. Add the following rules:

| Source CIDR | Protocol | Port | Description |
|-------------|----------|------|-------------|
| 0.0.0.0/0 | TCP | 22 | SSH (usually pre-configured) |
| 0.0.0.0/0 | TCP | 80 | HTTP |
| 0.0.0.0/0 | TCP | 443 | HTTPS |

### Step 6: Create Compute Instance

1. Navigate to **☰ Menu → Compute → Instances**
2. Click **Create Instance**
3. Configure:

**Basic Information:**
- **Name:** `credinvoice-server`

**Image:**
- **Operating System:** Canonical Ubuntu 22.04

**Shape:**
- **Shape Series:** Specialty and previous generation
- **Shape:** VM.Standard.E2.1.Micro (Always Free eligible)
- **OCPU:** 1
- **Memory:** 1 GB

**Networking:**
- **VCN:** `credinvoice-vcn`
- **Subnet:** `credinvoice-public-subnet`
- **Public IPv4 Address:** Assign automatically ✅

**SSH Keys:**
- Select **Generate a key pair for me**
- **Download Private Key** (save as `ssh-key.key`)

4. Click **Create**
5. Wait for instance status to become **Running**
6. Note the **Public IP Address**

---

## Server Configuration

### Connecting to Your Server

**Windows (PowerShell):**
```powershell
ssh -i "$env:USERPROFILE\Downloads\ssh-key.key" ubuntu@YOUR_PUBLIC_IP
```

**Mac/Linux:**
```bash
chmod 400 ~/Downloads/ssh-key.key
ssh -i ~/Downloads/ssh-key.key ubuntu@YOUR_PUBLIC_IP
```

### Server Setup Process

```mermaid
flowchart LR
    A[Connect SSH] --> B[Update System]
    B --> C[Install Node.js 20]
    C --> D[Install PostgreSQL]
    D --> E[Install Nginx]
    E --> F[Install PM2]
    F --> G[Create Swap]
    G --> H[Configure Firewall]
```

### Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:
```bash
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

### Step 3: Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

Verify installation:
```bash
sudo systemctl status postgresql
```

### Step 4: Install Nginx

```bash
sudo apt install -y nginx
```

### Step 5: Install PM2

```bash
sudo npm install -g pm2
```

### Step 6: Create Swap Space (Important for 1GB RAM)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Verify swap:
```bash
free -h  # Should show 2GB swap
```

### Step 7: Configure Firewall (iptables)

```bash
# View current rules
sudo iptables -L INPUT -n --line-numbers

# Add HTTP and HTTPS rules (before any REJECT rule)
sudo iptables -I INPUT 5 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Save rules
sudo netfilter-persistent save
```

> **Important:** Ensure ACCEPT rules for ports 80/443 are BEFORE any REJECT rules in the chain.

---

## Application Deployment

### Deployment Flow

```mermaid
flowchart TB
    subgraph Local[Local Machine]
        Zip[Project.zip]
    end
    
    subgraph Server[Oracle Server]
        Upload[Upload via SCP]
        Extract[Unzip Project]
        
        subgraph BackendSetup[Backend Setup]
            B1[npm install]
            B2[Create .env]
            B3[Prisma Generate]
            B4[Prisma DB Push]
            B5[npm run build]
            B6[PM2 Start]
        end
        
        subgraph FrontendSetup[Frontend Setup]
            F1[npm install]
            F2[npm run build]
            F3[Nginx Config]
        end
    end
    
    Zip -->|SCP| Upload
    Upload --> Extract
    Extract --> B1
    B1 --> B2 --> B3 --> B4 --> B5 --> B6
    Extract --> F1
    F1 --> F2 --> F3
```

### Step 1: Upload Project to Server

From your local machine (new terminal):

**Windows (PowerShell):**
```powershell
scp -i "$env:USERPROFILE\Downloads\ssh-key.key" "$env:USERPROFILE\Downloads\Credinvoice-main.zip" ubuntu@YOUR_PUBLIC_IP:~/
```

**Mac/Linux:**
```bash
scp -i ~/Downloads/ssh-key.key ~/Downloads/Credinvoice-main.zip ubuntu@YOUR_PUBLIC_IP:~/
```

### Step 2: Extract Project

```bash
cd ~
sudo apt install -y unzip
unzip Credinvoice-main.zip
ls  # Should show Credinvoice-main folder
```

### Step 3: Setup PostgreSQL Database

```bash
# Create database user and database
sudo -u postgres psql -c "CREATE USER credinvoice WITH PASSWORD 'YOUR_SECURE_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE credinvoice_db OWNER credinvoice;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE credinvoice_db TO credinvoice;"
```

### Step 4: Setup Backend

```bash
cd ~/Credinvoice-main/backend

# Install dependencies
npm install

# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000

DATABASE_URL="postgresql://credinvoice:YOUR_SECURE_PASSWORD@localhost:5432/credinvoice_db"

JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_MIN_32_CHARACTERS
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

FRONTEND_URL=http://YOUR_PUBLIC_IP
EOF

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name "credinvoice-api"
pm2 save

# Configure PM2 to start on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# Run the sudo command that PM2 outputs
```

### Step 5: Setup Frontend

```bash
cd ~/Credinvoice-main/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

---

## Database Migration

### Migrating from Neon PostgreSQL (or other cloud provider)

```mermaid
flowchart LR
    subgraph CloudDB[Cloud Database]
        NeonDB[(PostgreSQL)]
    end
    
    subgraph Oracle[Oracle Server]
        PGClient[pg_dump]
        LocalDB[(PostgreSQL Local)]
    end
    
    NeonDB -->|pg_dump| PGClient
    PGClient -->|SQL File| LocalDB
```

### Step 1: Install PostgreSQL Client (if version mismatch)

If your cloud database runs a newer PostgreSQL version:

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-client-17  # or your cloud DB version
```

### Step 2: Export from Cloud Database

```bash
# For Neon or similar providers
/usr/lib/postgresql/17/bin/pg_dump 'YOUR_CLOUD_DATABASE_CONNECTION_STRING' --no-owner --no-acl > cloud_backup.sql
```

### Step 3: Import to Local PostgreSQL

```bash
# Clear existing schema
sudo -u postgres psql -d credinvoice_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO credinvoice; GRANT ALL ON SCHEMA public TO public;"

# Import data
sudo -u postgres psql -d credinvoice_db < cloud_backup.sql

# Grant permissions (IMPORTANT!)
sudo -u postgres psql -d credinvoice_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO credinvoice; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO credinvoice; GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO credinvoice;"
```

### Step 4: Restart Backend

```bash
pm2 restart credinvoice-api
```

---

## Nginx Configuration

### Configuration File

Create `/etc/nginx/sites-available/credinvoice`:

```bash
sudo tee /etc/nginx/sites-available/credinvoice << 'EOF'
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;  # Or your domain name

    # Frontend - React static files
    location / {
        root /home/ubuntu/Credinvoice-main/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    client_max_body_size 10M;
}
EOF
```

### Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/credinvoice /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Fix Permissions

```bash
sudo chmod 755 /home/ubuntu
sudo chmod -R 755 /home/ubuntu/Credinvoice-main/frontend/dist
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Free SSL)

```mermaid
flowchart LR
    A[Install Certbot] --> B[Obtain Certificate]
    B --> C[Auto-configure Nginx]
    C --> D[Auto-renewal Setup]
```

### Prerequisites

- A domain name pointing to your server's IP
- Ports 80 and 443 open

### Step 1: Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain Certificate

```bash
sudo certbot --nginx -d yourdomain.com
```

### Step 3: Verify Auto-renewal

```bash
sudo certbot renew --dry-run
```

---

## Useful Commands

### PM2 (Process Manager)

```bash
# Check status
pm2 status

# View logs
pm2 logs credinvoice-api

# View logs (last 100 lines)
pm2 logs credinvoice-api --lines 100

# Restart application
pm2 restart credinvoice-api

# Stop application
pm2 stop credinvoice-api

# Delete application
pm2 delete credinvoice-api

# Monitor resources
pm2 monit
```

### Nginx

```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Reload (without downtime)
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### PostgreSQL

```bash
# Connect to database
sudo -u postgres psql -d credinvoice_db

# List tables
\dt

# Describe table
\d table_name

# Exit
\q

# Check status
sudo systemctl status postgresql

# Restart
sudo systemctl restart postgresql
```

### System Monitoring

```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check running processes
htop  # or top

# Check system logs
sudo journalctl -f
```

### Firewall (iptables)

```bash
# List rules with line numbers
sudo iptables -L INPUT -n --line-numbers

# Save rules
sudo netfilter-persistent save

# Reload rules
sudo netfilter-persistent reload
```

---

## Troubleshooting

### Common Issues and Solutions

```mermaid
flowchart TD
    A[Issue] --> B{Website not loading?}
    B -->|Yes| C{Can curl localhost?}
    C -->|No| D[Check Nginx & PM2]
    C -->|Yes| E[Check Firewall/Security List]
    
    B -->|No| F{API errors?}
    F -->|Yes| G[Check PM2 logs]
    G --> H{Database error?}
    H -->|Yes| I[Check PostgreSQL & permissions]
    H -->|No| J[Check .env configuration]
```

### Issue: Website not accessible

1. **Check if services are running:**
   ```bash
   sudo systemctl status nginx
   pm2 status
   ```

2. **Test locally:**
   ```bash
   curl http://localhost
   ```

3. **Check Oracle Cloud Security List** - Ensure ports 80, 443 have ingress rules

4. **Check server firewall:**
   ```bash
   sudo iptables -L INPUT -n --line-numbers
   ```
   Ensure ACCEPT rules for ports 80/443 are BEFORE any REJECT rule.

### Issue: 500 Internal Server Error

1. **Check Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check file permissions:**
   ```bash
   sudo chmod 755 /home/ubuntu
   sudo chmod -R 755 /home/ubuntu/Credinvoice-main/frontend/dist
   ```

### Issue: Database permission denied

**Symptom:** Error `permission denied for table`

**Solution:**
```bash
sudo -u postgres psql -d credinvoice_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO credinvoice; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO credinvoice; GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO credinvoice;"
pm2 restart credinvoice-api
```

### Issue: Backend not starting

1. **Check logs:**
   ```bash
   pm2 logs credinvoice-api --lines 50
   ```

2. **Verify .env file:**
   ```bash
   cat ~/Credinvoice-main/backend/.env
   ```

3. **Test database connection:**
   ```bash
   psql "postgresql://credinvoice:YOUR_PASSWORD@localhost:5432/credinvoice_db"
   ```

### Issue: Out of memory

1. **Check memory:**
   ```bash
   free -h
   ```

2. **Ensure swap is active:**
   ```bash
   swapon --show
   ```

3. **If no swap, create it:**
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Issue: Firewall blocking traffic

**Symptom:** Site works locally (`curl localhost`) but not from browser

**Solution:** Check iptables rule order:
```bash
sudo iptables -L INPUT -n --line-numbers
```

If REJECT rule is before port 80/443 ACCEPT rules:
```bash
# Delete the REJECT rule (check its line number first)
sudo iptables -D INPUT <REJECT_LINE_NUMBER>

# Add it back at the end
sudo iptables -A INPUT -j REJECT --reject-with icmp-host-prohibited

# Save
sudo netfilter-persistent save
```

---

## Maintenance & Updates

### Updating Application Code

```mermaid
flowchart LR
    A[Upload new code] --> B[Extract]
    B --> C[Backend: npm install]
    C --> D[Backend: npm run build]
    D --> E[PM2 restart]
    B --> F[Frontend: npm install]
    F --> G[Frontend: npm run build]
    G --> H[Done!]
```

```bash
# Upload new zip file, then:
cd ~
unzip -o Credinvoice-main.zip

# Update backend
cd ~/Credinvoice-main/backend
npm install
npm run build
pm2 restart credinvoice-api

# Update frontend
cd ~/Credinvoice-main/frontend
npm install
npm run build
```

### Database Backup

```bash
# Create backup
sudo -u postgres pg_dump credinvoice_db > backup_$(date +%Y%m%d).sql

# Restore from backup
sudo -u postgres psql -d credinvoice_db < backup_20251231.sql
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Reboot if kernel was updated
sudo reboot
```

### Monitoring Disk Space

```bash
# Check disk usage
df -h

# Find large files
du -sh ~/Credinvoice-main/*

# Clean npm cache
npm cache clean --force

# Clean apt cache
sudo apt autoremove -y
sudo apt clean
```

---

## Server Details Template

> ⚠️ **Store these securely - do not commit to public repositories!**

| Property | Value |
|----------|-------|
| **Public IP** | `YOUR_PUBLIC_IP` |
| **SSH User** | `ubuntu` |
| **SSH Key** | `your-ssh-key.key` |
| **App URL** | `http://YOUR_PUBLIC_IP` |
| **Backend Port** | `3000` |
| **Database Name** | `credinvoice_db` |
| **DB User** | `credinvoice` |
| **DB Password** | `YOUR_SECURE_PASSWORD` |
| **JWT Secret** | `YOUR_JWT_SECRET` |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    QUICK COMMANDS                           │
├─────────────────────────────────────────────────────────────┤
│ Connect:    ssh -i "key.key" ubuntu@YOUR_IP                │
│                                                             │
│ Backend:    pm2 status                                      │
│             pm2 logs credinvoice-api                        │
│             pm2 restart credinvoice-api                     │
│                                                             │
│ Nginx:      sudo systemctl status nginx                     │
│             sudo nginx -t && sudo systemctl reload nginx    │
│                                                             │
│ Database:   sudo -u postgres psql -d credinvoice_db        │
│                                                             │
│ Logs:       pm2 logs credinvoice-api --lines 50            │
│             sudo tail -f /var/log/nginx/error.log          │
│                                                             │
│ Memory:     free -h                                         │
│ Disk:       df -h                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Recommendations

1. **Change default passwords** - Use strong, unique passwords for database and JWT secrets
2. **Keep system updated** - Run `sudo apt update && sudo apt upgrade` regularly
3. **Setup SSL** - Use Let's Encrypt for free HTTPS
4. **Backup regularly** - Schedule automatic database backups
5. **Monitor logs** - Check for suspicious activity
6. **Restrict SSH** - Consider changing SSH port or using key-only authentication
7. **Use environment variables** - Never commit secrets to version control

---

## License

This deployment guide is created for the CredInvoice project.

---

*Last updated: December 31, 2025*

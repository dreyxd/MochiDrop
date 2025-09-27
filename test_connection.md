# 🔌 Testing VPS Connection

## Windows (PowerShell/CMD)

### Using Password Authentication:
```powershell
ssh username@your.server.ip.address
# Example: ssh root@123.456.789.012
```

### Using SSH Key:
```powershell
ssh -i path\to\your\key.pem username@your.server.ip.address
# Example: ssh -i C:\Users\YourName\.ssh\id_rsa root@123.456.789.012
```

## What You Should See:
```
The authenticity of host '123.456.789.012 (123.456.789.012)' can't be established.
ECDSA key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '123.456.789.012' (ECDSA) to the list of known hosts.
root@your-server:~#
```

## If Connection Fails:

### 1. Check IP Address
- Make sure IP is correct
- Try pinging: `ping your.server.ip.address`

### 2. Check Username
- Try `root`, `ubuntu`, `admin`, or `ec2-user`

### 3. Check SSH Key Permissions (if using keys)
```powershell
# On Windows, ensure key file has proper permissions
icacls "path\to\key.pem" /inheritance:r /grant:r "%username%:R"
```

### 4. Check Port
- Default SSH port is 22
- Some providers use different ports: `ssh -p 2222 username@ip`

### 5. Firewall Issues
- Check if your ISP blocks SSH (port 22)
- Try from different network/location

## Alternative Connection Methods:

### 1. VPS Provider Console
- Most providers offer browser-based console
- Access through their dashboard
- No SSH client needed

### 2. PuTTY (Windows)
- Download PuTTY SSH client
- Enter IP, username, password
- Graphical interface

### 3. Windows Subsystem for Linux (WSL)
```powershell
wsl
ssh username@your.server.ip.address
```

## Ready for Deployment?

Once you can successfully connect and see the server prompt (like `root@server:~#`), you're ready for MochiDrop deployment!

Provide these details:
- ✅ Server IP: `xxx.xxx.xxx.xxx`
- ✅ Username: `root` (or whatever works)
- ✅ Authentication method: password or SSH key
- ✅ Successful connection test
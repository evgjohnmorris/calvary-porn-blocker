# Calvary Blocker: Console Protection Guide

Gaming consoles like the Nintendo Switch, PlayStation Vita, PlayStation 4/5, and Xbox present a unique challenge. Because these devices run closed, proprietary operating systems, it is impossible to install native background applications (like our Mobile VPN or Desktop agent) to filter content, unless the console has been heavily modified (jailbroken/homebrewed).

To protect users on these devices, we must enforce filtering at the **Network Level**.

This guide explains how to configure your gaming consoles to use the Calvary Blocker DNS Sinkhole.

## The Strategy: DNS Filtering

By changing the Domain Name System (DNS) server settings on the console, we force all internet traffic (including the built-in web browser and games) to ask our secure server for directions. If the console asks for an explicit website, our DNS server will return a "blocked" response, preventing the content from loading.

### What You Need

You need the IP addresses of your Secure DNS. This is either:
1. **The Cloud DNS:** (e.g., Cloudflare Families: `1.1.1.3` and `1.0.0.3`)
2. **Your Local Network Agent:** If you are running the Calvary Blocker agent on a local PC/Raspberry Pi that acts as a DNS sinkhole, use the local IP address of that machine (e.g., `192.168.1.50`).

---

## Nintendo Switch Setup

1. Go to the Home Menu and select **System Settings** (the gear icon).
2. Scroll down to **Internet** and select **Internet Settings**.
3. Select your current Wi-Fi network from the list of "Registered Networks".
4. Choose **Change Settings**.
5. Scroll down to **DNS Settings**. By default, this is set to "Automatic". Change it to **Manual**.
6. Select **Primary DNS**. Erase the current numbers (usually 0.0.0.0) and enter your Secure Primary DNS IP (e.g., `001.001.001.003` for Cloudflare).
7. Select **Secondary DNS**. Enter your Secure Secondary DNS IP (e.g., `001.000.000.003`).
8. Select **Save** on the right side of the screen.

> **Note on Testing:** Open the "News" app on the Switch and click a link that opens the hidden web browser, or try linking a social media account. Test navigating to a known blocked site to ensure the DNS is actively dropping the connection.

---

## PlayStation Vita Setup

1. Open the **Settings** app from the LiveArea screen.
2. Tap on **Network**, then **Wi-Fi Settings**.
3. Tap on the Wi-Fi access point you are currently connected to.
4. Tap **Advanced Settings**.
5. Scroll down to **DNS Settings** and change it from "Automatic" to **Manual**.
6. Under **Primary DNS**, enter your Secure Primary DNS IP (e.g., `1.1.1.3`).
7. Under **Secondary DNS**, enter your Secure Secondary DNS IP (e.g., `1.0.0.3`).
8. Tap **OK** at the bottom right to save the settings.

> **Note on Testing:** Open the built-in PS Vita Web Browser app. Navigate to a known blocked site. The browser should display an error indicating it cannot connect to the server or resolve the host.

---

## Best Practices & Security

- **Router-Level Enforcement:** Manually changing DNS on a console can be bypassed by an advanced user simply switching it back to "Automatic". For complete protection, it is highly recommended to set the secure DNS at the **Router Level**. This forces every device on your home network (including all consoles and smart TVs) to use the filtered DNS, and usually requires an Admin password to change.
- **Guest Networks:** Ensure your router's "Guest Network" is also configured to use the filtered DNS to prevent workarounds.

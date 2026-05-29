import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

export function ChatWidget() {
  const location = useLocation();
  const pathname = location.pathname;

  const isHomepage = pathname === "/";
  const isDashboard = pathname.includes("/dashboard") || pathname.includes("/landlord") || pathname.includes("/renter");
  const shouldShow = isHomepage || isDashboard;

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const cleanupBotnoiElements = () => {
      const generated = document.querySelectorAll('[id^="botnoi-"], [class^="botnoi-"], iframe[src*="botnoi"]');
      generated.forEach(el => el.remove());
    };

    const clearBotnoiMemory = () => {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.toLowerCase().includes("botnoi") || key.startsWith("bn_") || key.startsWith("bn-")) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach(key => {
          if (key.toLowerCase().includes("botnoi") || key.startsWith("bn_") || key.startsWith("bn-")) {
            sessionStorage.removeItem(key);
          }
        });
     
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.toLowerCase().includes("botnoi") || name.startsWith("bn")) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }
        }
      } catch (e) {
        console.log("Botnoi storage and cookie clearance skipped");
      }
    };

    if (!shouldShow) {
      cleanupBotnoiElements();
      return;
    }

    cleanupBotnoiElements();
    clearBotnoiMemory();

    if (!document.getElementById("bn-custom-style")) {
      const style = document.createElement("style");
      style.id = "bn-custom-style";
      style.textContent = `
        iframe[id^="botnoi-"], .bn-customerchat, #bn-root, [id^="botnoi-customerchat"], .botnoi-customerchat-container { 
          bottom: 24px !important;   
          right: 24px !important;    
          z-index: 99999 !important; 
        }
        iframe[id^="botnoi-"] {
          filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.12)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06)) !important;
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), filter 0.25s ease !important;
        }
        iframe[id^="botnoi-"]:hover {
          transform: translateY(-5px) scale(1.02) !important;
          filter: drop-shadow(0 20px 38px rgba(0, 0, 0, 0.16)) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.08)) !important;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);
    }

    const initBotnoi = () => {
      const win = window as any;
      if (win.BN) {
        try {
          win.BN.init({ version: "1.0" });
        } catch (e) {
          console.log("Botnoi core reactivated with clean memory");
        }
      }
    };

    let script = document.getElementById("bn-jssdk") as HTMLScriptElement;
    if (script) script.remove();

    script = document.createElement("script");
    script.id = "bn-jssdk";
    script.async = true;
    script.src = `https://console.botnoi.ai/customerchat/index.js?v=${Date.now()}`;
    script.onload = () => {
      setTimeout(initBotnoi, 150);
    };
    document.body.appendChild(script);

    return () => {
      cleanupBotnoiElements();
    };
  }, [pathname, shouldShow]);

  if (!shouldShow) return null;

  return (
    <div id="bn-root">
      <div
        className="bn-customerchat"
        bot_id="6a0c0afb27dc008651083b76"
        bot_logo="https://img1.pic.in.th/images/botnoi_group_logo-fotor-20260528143934.png"
        bot_name="Nong BOTNOI"
        theme_color="#e2f2ff"
        locale="th"
        logged_in_greeting="สวัสดีครับ มีอะไรให้น้องบอทช่วยไหมครับ"
        greeting_message="สวัสดีครับ ผู้ช่วยน้องบอทน้อยเองครับ หากมีอะไรสงสัยเพิ่มเติมให้น้องบอทช่วยนะครับ หรือถ้าต้องการติดต่อแอดมินสามารถพิมพ์คำว่า 'แอดมิน' ได้เลยนะครับ
"
        default_open="false"
      />
    </div>
  );
}

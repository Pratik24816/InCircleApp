/**
 * Copy to api.config.local.ts and set your PC's Wi-Fi IP.
 * Find IP: hostname -I | awk '{print $1}'
 * Phone and laptop must be on the same Wi-Fi.
 *
 * USB alternative: keep DEV_API_HOST = '127.0.0.1' and run:
 *   adb reverse tcp:3000 tcp:3000
 */
export const DEV_API_HOST = '192.168.1.42';

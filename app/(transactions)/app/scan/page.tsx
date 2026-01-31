"use client";

import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Html5Qrcode } from "html5-qrcode";
import { QrCode, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export default function ScanPage() {
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunningRef = useRef(false);

  useEffect(() => {
    const startScanning = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            setScannedData(decodedText);
            isScannerRunningRef.current = false;
            html5QrCode.stop().catch(() => {});

            // Handle username (@...) - primary method for CDT
            if (decodedText.startsWith("@")) {
              router.push(
                `${ROUTES.SEND}?recipient=${encodeURIComponent(decodedText)}&token=CDT`
              );
            }
            // Handle wallet address (0x...) - fallback, default to CDT token
            else if (
              decodedText.startsWith("0x") &&
              decodedText.length === 42
            ) {
              router.push(
                `${ROUTES.SEND}?recipient=${encodeURIComponent(decodedText)}&token=CDT`
              );
            }
            // Handle plain username without @ prefix
            else if (
              !decodedText.startsWith("0x") &&
              !/^[a-fA-F0-9]{40}$/.test(decodedText)
            ) {
              // Assume it's a username
              router.push(
                `${ROUTES.SEND}?recipient=${encodeURIComponent(`@${decodedText}`)}&token=CDT`
              );
            }
            // Handle plain address without 0x prefix
            else if (/^[a-fA-F0-9]{40}$/.test(decodedText)) {
              router.push(
                `${ROUTES.SEND}?recipient=${encodeURIComponent(`0x${decodedText}`)}&token=CDT`
              );
            }
          },
          () => {}
        );
        isScannerRunningRef.current = true;
      } catch {
        isScannerRunningRef.current = false;
      }
    };

    startScanning();

    return () => {
      if (scannerRef.current && isScannerRunningRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            isScannerRunningRef.current = false;
            scannerRef.current = null;
          })
          .catch(() => {
            isScannerRunningRef.current = false;
            scannerRef.current = null;
          });
      }
    };
  }, [router]);

  const handleScanned = (data: string) => {
    // Handle username (@...) - primary method for CDT
    if (data.startsWith("@")) {
      router.push(
        `${ROUTES.SEND}?recipient=${encodeURIComponent(data)}&token=CDT`
      );
    }
    // Handle wallet address (0x...) - fallback, default to CDT token
    else if (data.startsWith("0x") && data.length === 42) {
      router.push(
        `${ROUTES.SEND}?recipient=${encodeURIComponent(data)}&token=CDT`
      );
    }
    // Handle plain username without @ prefix
    else if (!data.startsWith("0x") && !/^[a-fA-F0-9]{40}$/.test(data)) {
      // Assume it's a username
      router.push(
        `${ROUTES.SEND}?recipient=${encodeURIComponent(`@${data}`)}&token=CDT`
      );
    }
    // Handle plain address without 0x prefix
    else if (/^[a-fA-F0-9]{40}$/.test(data)) {
      router.push(
        `${ROUTES.SEND}?recipient=${encodeURIComponent(`0x${data}`)}&token=CDT`
      );
    }
  };

  const handleBack = () => {
    if (scannerRef.current && isScannerRunningRef.current) {
      isScannerRunningRef.current = false;
      scannerRef.current.stop().catch(() => {});
    }
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black">
      <div className="flex-1 relative overflow-hidden min-h-0">
        <div id="reader" className="w-full h-full" />

        {scannedData && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="p-6 bg-background rounded-xl border border-border max-w-sm mx-4">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-green-600/10">
                  <QrCode className="h-12 w-12 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    QR Code Scanned
                  </p>
                  <p className="text-xs text-muted-foreground break-all">
                    {scannedData}
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleScanned(scannedData)}
                >
                  Continue to Send
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full px-4 py-4 bg-background border-t border-border shrink-0">
        <Link href={ROUTES.RECEIVE} className="w-full">
          <Button variant="outline" className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            Show my QR
          </Button>
        </Link>
        <Button variant="secondary" className="w-full" onClick={handleBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

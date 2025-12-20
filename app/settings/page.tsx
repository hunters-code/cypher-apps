import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">←</Button>
        </Link>
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="w-10"></div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Account</h2>
          <div className="space-y-2">
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">@nashirjamali</p>
                <p className="text-xs text-muted-foreground">Change username</p>
              </div>
              <Button variant="ghost" size="sm">→</Button>
            </div>
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-xs">0x9a3d6c5f8e2b1a7c4d9e...</p>
                <p className="text-xs text-muted-foreground">View wallet address</p>
              </div>
              <Button variant="ghost" size="sm">→</Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Security</h2>
          <div className="space-y-2">
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Backup & Recovery</p>
                <p className="text-xs text-muted-foreground">Save your wallet securely</p>
              </div>
              <Button variant="ghost" size="sm">→</Button>
            </div>
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Privacy Settings</p>
                <p className="text-xs text-muted-foreground">Manage stealth address preferences</p>
              </div>
              <Button variant="ghost" size="sm">→</Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Preferences</h2>
          <div className="space-y-2">
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-xs text-muted-foreground">USD - United States Dollar</p>
              </div>
              <Button variant="ghost" size="sm">→</Button>
            </div>
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">Transaction alerts</p>
              </div>
              <Button variant="outline" size="sm">Toggle ON</Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">About</h2>
          <div className="space-y-2">
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <p className="font-medium">Help & Support</p>
              <Button variant="ghost" size="sm">→</Button>
            </div>
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <p className="font-medium">Terms & Privacy</p>
              <Button variant="ghost" size="sm">→</Button>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </div>

        <Button variant="destructive" className="w-full rounded-full">Logout</Button>
      </div>
    </div>
  );
}


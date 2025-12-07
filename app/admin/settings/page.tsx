"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Bell, Lock, CreditCard, Store, Mail, Shield, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { getAdminSettings, saveAdminSettings, type AdminSettings } from "@/lib/settings-service"

function AdminSettingsContent() {
  const [activeTab, setActiveTab] = useState("store")
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const [settings, setSettings] = useState<AdminSettings>({
    storeName: "swebirdshop",
    storeEmail: "admin@swebirdshop.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Main St, City, State 12345",
    currency: "USD",
    taxRate: "8.5",
    shippingCost: "9.99",
    freeShippingThreshold: "50",
    notificationsEmail: true,
    notificationsSms: false,
    notificationsOrders: true,
    notificationsProducts: true,
    twoFactorAuth: false,
    passwordMinLength: "8",
    sessionTimeout: "30",
    stripeKey: "sk_test_****",
    paypalEmail: "business@example.com",
    mailerServiceProvider: "sendgrid",
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const loadedSettings = await getAdminSettings()
      setSettings(loadedSettings)
      setLoading(false)
    } catch (error) {
      console.error("Error loading settings:", error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await saveAdminSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    }
  }

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { id: "store", label: "Store Settings", icon: Store },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "email", label: "Email", icon: Mail },
  ]

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Settings</h1>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-border">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Store Settings */}
          {activeTab === "store" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Store Name</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleInputChange("storeName", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => handleInputChange("storeEmail", e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={settings.storePhone}
                        onChange={(e) => handleInputChange("storePhone", e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      value={settings.storeAddress}
                      onChange={(e) => handleInputChange("storeAddress", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Billing Settings</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleInputChange("currency", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>CAD</option>
                      <option>AUD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.taxRate}
                      onChange={(e) => handleInputChange("taxRate", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Shipping Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.shippingCost}
                      onChange={(e) => handleInputChange("shippingCost", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Free Shipping Over</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => handleInputChange("freeShippingThreshold", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/5">
                  <input
                    type="checkbox"
                    checked={settings.notificationsEmail}
                    onChange={(e) => handleInputChange("notificationsEmail", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/5">
                  <input
                    type="checkbox"
                    checked={settings.notificationsSms}
                    onChange={(e) => handleInputChange("notificationsSms", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts via SMS</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/5">
                  <input
                    type="checkbox"
                    checked={settings.notificationsOrders}
                    onChange={(e) => handleInputChange("notificationsOrders", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Order Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about new orders</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/5">
                  <input
                    type="checkbox"
                    checked={settings.notificationsProducts}
                    onChange={(e) => handleInputChange("notificationsProducts", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Product Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about inventory changes</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/5">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleInputChange("twoFactorAuth", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                  </label>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
                    <input
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleInputChange("passwordMinLength", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange("sessionTimeout", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Account Access
                </h2>
                <button className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 font-medium">
                  Change Password
                </button>
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Methods
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Stripe API Key</label>
                  <input
                    type="password"
                    value={settings.stripeKey}
                    onChange={(e) => handleInputChange("stripeKey", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your API key is encrypted and secure</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">PayPal Email</label>
                  <input
                    type="email"
                    value={settings.paypalEmail}
                    onChange={(e) => handleInputChange("paypalEmail", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          {activeTab === "email" && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Service Provider</label>
                  <select
                    value={settings.mailerServiceProvider}
                    onChange={(e) => handleInputChange("mailerServiceProvider", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="aws">AWS SES</option>
                    <option value="smtp">SMTP Server</option>
                  </select>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground">
                    Configure your email provider to send order confirmations, password resets, and notifications to
                    customers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 font-medium"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            {saved && <p className="text-green-600 font-medium">Settings saved successfully!</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminSettings() {
  return (
    <AdminProvider>
      <AdminSettingsContent />
    </AdminProvider>
  )
}

"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Bell, Lock, CreditCard, Store, Mail, Shield, Save, X, KeyRound, Mail as MailIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { getAdminSettings, saveAdminSettings, type AdminSettings } from "@/lib/settings-service"
import { useAuth } from "@/lib/auth-context"
import { sendPasswordChangeVerificationCode, verifyCodeAndChangePassword } from "@/lib/password-change-service"

function AdminSettingsContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("store")
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordStep, setPasswordStep] = useState<"request" | "verify">("request")
  const [verificationCode, setVerificationCode] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [settings, setSettings] = useState<AdminSettings>({
    storeName: "swebirdshop",
    storeEmail: "admin@swebirdshop.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Main St, City, State 12345",
    currency: "INR",
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
    razorpayKeyId: "rzp_live_Rxsf6lkhhXIzQr",
    razorpayKeySecret: "sN8ke5Kuu5ae3vBoMNZWTIMs",
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
                      <option>INR</option>
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
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Change your admin account password. A verification code will be sent to your email.
                    </p>
                    <button
                      onClick={() => {
                        setShowPasswordModal(true)
                        setPasswordStep("request")
                        setPasswordError("")
                        setPasswordSuccess("")
                        setVerificationCode("")
                        setCurrentPassword("")
                        setNewPassword("")
                        setConfirmPassword("")
                      }}
                      className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                  {user && (
                    <div className="text-sm text-muted-foreground">
                      <p>Current email: <span className="font-medium text-foreground">{user.email}</span></p>
                    </div>
                  )}
                </div>
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
                  <label className="block text-sm font-medium mb-2">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={settings.razorpayKeyId}
                    onChange={(e) => handleInputChange("razorpayKeyId", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    placeholder="rzp_live_..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your Razorpay Key ID (public key)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Razorpay Key Secret</label>
                  <input
                    type="password"
                    value={settings.razorpayKeySecret}
                    onChange={(e) => handleInputChange("razorpayKeySecret", e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    placeholder="Enter your secret key"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your Razorpay Key Secret (keep this secure)</p>
                </div>
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Razorpay is now your active payment gateway. All payments will be processed through Razorpay's secure payment system.
                  </p>
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                Change Password
              </h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordStep("request")
                  setPasswordError("")
                  setPasswordSuccess("")
                }}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordStep === "request" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A verification code will be sent to your email address. You'll need this code to change your password.
                </p>
                {user && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Email address:</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                )}
                {passwordError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{passwordError}</p>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-800">{passwordSuccess}</p>
                  </div>
                )}
                <button
                  onClick={async () => {
                    if (!user?.email) {
                      setPasswordError("User email not found. Please log in again.")
                      return
                    }
                    setSendingCode(true)
                    setPasswordError("")
                    setPasswordSuccess("")
                    const result = await sendPasswordChangeVerificationCode(user.email)
                    if (result.success) {
                      setPasswordSuccess(result.message)
                      setTimeout(() => {
                        setPasswordStep("verify")
                        setPasswordSuccess("")
                      }, 2000)
                    } else {
                      setPasswordError(result.message)
                    }
                    setSendingCode(false)
                  }}
                  disabled={sendingCode}
                  className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MailIcon className="w-4 h-4" />
                  {sendingCode ? "Sending..." : "Send Verification Code"}
                </button>
              </div>
            )}

            {passwordStep === "verify" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the verification code sent to your email, your current password, and your new password.
                </p>
                {passwordError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{passwordError}</p>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-800">{passwordSuccess}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={async () => {
                      if (!user?.email) {
                        setPasswordError("User email not found. Please log in again.")
                        return
                      }
                      if (!verificationCode || verificationCode.length !== 6) {
                        setPasswordError("Please enter a valid 6-digit verification code.")
                        return
                      }
                      if (!currentPassword) {
                        setPasswordError("Please enter your current password.")
                        return
                      }
                      if (!newPassword || newPassword.length < 6) {
                        setPasswordError("New password must be at least 6 characters.")
                        return
                      }
                      if (newPassword !== confirmPassword) {
                        setPasswordError("New passwords do not match.")
                        return
                      }
                      setChangingPassword(true)
                      setPasswordError("")
                      setPasswordSuccess("")
                      const result = await verifyCodeAndChangePassword(
                        user.email,
                        verificationCode,
                        newPassword,
                        currentPassword
                      )
                      if (result.success) {
                        setPasswordSuccess(result.message)
                        setTimeout(() => {
                          setShowPasswordModal(false)
                          setPasswordStep("request")
                          setVerificationCode("")
                          setCurrentPassword("")
                          setNewPassword("")
                          setConfirmPassword("")
                          setPasswordSuccess("")
                        }, 2000)
                      } else {
                        setPasswordError(result.message)
                      }
                      setChangingPassword(false)
                    }}
                    disabled={changingPassword}
                    className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    onClick={() => {
                      setPasswordStep("request")
                      setPasswordError("")
                      setPasswordSuccess("")
                    }}
                    disabled={changingPassword}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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

import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy - Biteclub",
  description:
    "Learn how Biteclub collects, uses, and protects your information when you use our app.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-center gap-4">
        <Image src="/icon.png" alt="Biteclub icon" width={56} height={56} />
        <div>
          <h1 className="text-2xl font-semibold">Privacy Policy for Biteclub</h1>
          <p className="text-sm opacity-70">Last Updated: August 8, 2025</p>
        </div>
      </header>

      <p className="mb-4">
        Welcome to Biteclub! This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you use our mobile
        application (the "App"). Please read this privacy policy carefully. If
        you do not agree with the terms of this privacy policy, please do not
        access the application.
      </p>
      <p className="mb-8">
        We reserve the right to make changes to this Privacy Policy at any time
        and for any reason. We will alert you about any changes by updating the
        "Last Updated" date of this Privacy Policy. You are encouraged to
        periodically review this Privacy Policy to stay informed of updates.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Collection of Your Information</h2>
        <p className="mb-3">
          We may collect information about you in a variety of ways. The
          information we may collect via the App includes:
        </p>

        <h3 className="font-semibold mb-1">Personal Data</h3>
        <p className="mb-3">
          Information you provide, such as your name, username, profile photo,
          and phone number (required for SMS sign‑in). You may optionally provide
          an email address if you use email/password sign‑in. You also provide
          content you upload (for example, photos, videos, captions, comments).
          We do not request age, gender, or other demographic data.
        </p>

        <h3 className="font-semibold mb-1">Derivative Data</h3>
        <p className="mb-3">
          Information our servers automatically collect when you access the App,
          such as your native actions that are integral to the App, including
          liking, commenting, or replying to a post, as well as other
          interactions with the App and other users via server log files.
        </p>

        <h3 className="font-semibold mb-1">Financial Data</h3>
        <p className="mb-3">We do not collect any financial information.</p>

        <h3 className="font-semibold mb-1">Mobile Device Access</h3>
        <p className="mb-3">
          We may request access or permission to certain features from your
          mobile device, including your mobile device's camera, contacts, and
          storage. If you wish to change our access or permissions, you may do
          so in your device's settings.
        </p>

        <h3 className="font-semibold mb-1">Mobile Device Data</h3>
        <p className="mb-3">
          If you sign in, we store your phone number with your profile. When you
          enable notifications, we store a push token and your device type (iOS
          or Android) to deliver notifications. We do not collect precise
          location data.
        </p>

        <h3 className="font-semibold mb-1">Push Notifications</h3>
        <p className="mb-3">
          We request permission to send you push notifications related to your
          account and app activity (for example, meal reminders). Some
          categories may be enabled by default after you grant permission. You
          can change these preferences in Settings at any time or disable
          notifications in your device settings.
        </p>

        <h3 className="font-semibold mb-1">Contacts Matching (optional)</h3>
        <p>
          If you choose to find friends, we will request access to your address
          book and upload phone numbers to our servers solely to check which of
          your contacts use Biteclub. We do not store your address book; the
          numbers are used for one-time matching and then discarded.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Use of Your Information</h2>
        <p className="mb-3">
          Having accurate information about you permits us to provide you with a
          smooth, efficient, and customized experience. Specifically, we may use
          information collected about you via the App to:
        </p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Create and manage your account.</li>
          <li>Contact you about your account or service updates.</li>
          <li>Enable user-to-user communications.</li>
          <li>
            Generate a personal profile about you to make future visits to the
            App more personalized.
          </li>
          <li>Increase the efficiency and operation of the App.</li>
          <li>
            Monitor and analyze usage and trends to improve your experience with
            the App.
          </li>
          <li>Notify you of updates to the App.</li>
          <li>Offer new features and recommendations to you.</li>
          <li>Perform other service-related operations as needed.</li>
          <li>
            Prevent fraudulent transactions, monitor against theft, and protect
            against criminal activity.
          </li>
          <li>Request feedback and contact you about your use of the App.</li>
          <li>Resolve disputes and troubleshoot problems.</li>
          <li>Respond to product and customer service requests.</li>
          <li>Solicit support for the App.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Disclosure of Your Information</h2>
        <h3 className="font-semibold mb-1">By Law or to Protect Rights</h3>
        <p className="mb-3">
          If we believe the release of information about you is necessary to
          respond to legal process, to investigate or remedy potential
          violations of our policies, or to protect the rights, property, and
          safety of others, we may share your information as permitted or
          required by any applicable law, rule, or regulation.
        </p>

        <h3 className="font-semibold mb-1">Third-Party Service Providers</h3>
        <p className="mb-3">
          We may share your information with third parties that perform services
          for us or on our behalf, including payment processing, data analysis,
          email delivery, hosting services, customer service, and marketing
          assistance.
        </p>
        <ul className="list-disc pl-6 mb-3 space-y-1">
          <li>
            <strong>Supabase:</strong> We use Supabase for our backend, database,
            and authentication. You can review their privacy policy {" "}
            <a
              href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
              className="underline"
            >
              here
            </a>
            .
          </li>
          <li>
            <strong>Cloudflare (Images & Stream):</strong> We host user-uploaded
            photos and videos with Cloudflare. See Cloudflare's privacy policy {" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
              className="underline"
            >
              here
            </a>
            .
          </li>
          <li>
            <strong>Expo Notifications:</strong> We use Expo's push notification
            service to deliver notifications. Their privacy policy is available {" "}
            <a
              href="https://expo.dev/privacy"
          target="_blank"
          rel="noopener noreferrer"
              className="underline"
            >
              here
            </a>
            .
          </li>
          <li>
            <strong>Sentry (error reporting):</strong> Our media API uses Sentry
            to capture errors. Limited context (such as your user ID) may be
            sent to diagnose issues. See Sentry's privacy policy {" "}
            <a
              href="https://sentry.io/privacy/"
          target="_blank"
          rel="noopener noreferrer"
              className="underline"
            >
              here
            </a>
            .
          </li>
        </ul>

        <h3 className="font-semibold mb-1">Interactions with Other Users</h3>
        <p className="mb-3">
          If you interact with other users of the App, those users may see your
          name, profile photo, and descriptions of your activity, including
          posting content, commenting, liking, or following.
        </p>

        <h3 className="font-semibold mb-1">Online Postings</h3>
        <p className="mb-3">
          When you post comments, contributions or other content to the App,
          your posts may be viewed by all users and may be publicly distributed
          outside the App in perpetuity.
        </p>

        <h3 className="font-semibold mb-1">Affiliates</h3>
        <p className="mb-3">
          We may share your information with our affiliates, in which case we
          will require those affiliates to honor this Privacy Policy. Affiliates
          include our parent company and any subsidiaries, joint venture
          partners or other companies that we control or that are under common
          control with us.
        </p>

        <h3 className="font-semibold mb-1">Business Partners</h3>
        <p>
          We may share your information with our business partners to offer you
          certain products, services or promotions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">App Storage and Tracking</h2>

        <h3 className="font-semibold mb-1">Local Storage</h3>
        <p className="mb-3">
          The mobile app does not use browser cookies. We store your
          authentication session on your device using local storage (AsyncStorage)
          so you stay signed in. We do not sell your personal information or use
          your data for third‑party advertising or cross‑app tracking.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Third-Party Websites</h2>
        <p>
          The App may contain links to third-party websites and applications of
          interest, including advertisements and external services, that are not
          affiliated with us. Once you have used these links to leave the App,
          any information you provide to these third parties is not covered by
          this Privacy Policy, and we cannot guarantee the safety and privacy of
          your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Security of Your Information</h2>
        <p>
          We use administrative, technical, and physical security measures to
          help protect your personal information. While we have taken reasonable
          steps to secure the personal information you provide to us, please be
          aware that despite our efforts, no security measures are perfect or
          impenetrable, and no method of data transmission can be guaranteed
          against any interception or other type of misuse.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Policy for Children</h2>
        <p>
          We do not knowingly solicit information from or market to children
          under the age of 13. If you become aware of any data we have
          collected from children under age 13, please contact us using the
          contact information provided below.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Data Retention and Deletion</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Content you upload</strong> (photos, videos, captions, comments)
            is kept until you delete it or delete your account.
          </li>
          <li>
            <strong>Push notification tokens</strong> are stored while
            notifications are enabled to deliver notifications. If you disable
            notifications or sign out, we stop using your token. You can request
            removal at any time using the contact information below.
          </li>
          <li>
            <strong>Backups and logs</strong> may retain limited data for a
            short period for security, backup, and troubleshooting purposes
            before automatic deletion.
          </li>
          <li>
            <strong>Account deletion</strong>: You will be able to delete your
            account from Settings. After deletion, your profile and content are
            removed from our active systems; residual copies may persist in
            backups for a limited time.
          </li>
        </ul>
      </section>


      <section>
        <h2 className="text-xl font-semibold mb-3">
          Options Regarding Your Information
        </h2>

        <h3 className="font-semibold mb-1">Account Information</h3>
        <p className="mb-3">
          You may at any time review or change the information in your account
          or terminate your account by:
        </p>
        <ul className="list-disc pl-6 mb-3 space-y-1">
          <li>Logging into your account settings and updating your account</li>
          <li>Contacting us using the contact information provided below</li>
        </ul>
        <p className="mb-3">
          Upon your request to terminate your account, we will deactivate or
          delete your account and information from our active databases. However,
          some information may be retained in our files to prevent fraud,
          troubleshoot problems, assist with any investigations, enforce our
          Terms of Use and/or comply with legal requirements.
        </p>

        <h3 className="font-semibold mb-1">Emails and Communications</h3>
        <p className="mb-3">
          If you no longer wish to receive correspondence, emails, or other
          communications from us, you may opt-out by:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Noting your preferences at the time you register your account with
            the App
          </li>
          <li>Logging into your account settings and updating your preferences.</li>
          <li>Contacting us using the contact information provided below</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
        <p className="mb-2">
          If you have questions or comments about this Privacy Policy, please
          contact us at:
        </p>
        <address className="not-italic leading-6">
          Biteclub
          <br />
          wejarrard@gmail.com
          <br />
          +1 (608) 772-8104
        </address>
      </section>
    </div>
  );
}

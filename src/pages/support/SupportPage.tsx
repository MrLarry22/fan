import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Book, Users, Shield } from 'lucide-react';
import AnimatedSection from '../../components/ui/AnimatedSection';

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const aboutFanviewArticles = [
    {
      id: 'about-fanview',
      title: 'About Fanview',
      updated: 'Updated over 3 months ago',
      excerpt: 'Learn about our mission and core values',
      content: `Fanview is a social subscription platform built and designed with leading creators to redefine the standards of how content creators share, earn and connect with their following. Our mission is to empower all creators to create, share and earn on a safe and secure platform. We believe great interactions take place on great platforms with great tech. We're committed to building and always evolving a cutting-edge platform for all creators and all fans.

At Fanview, we strive to provide creators and fans with the best experiences possible. We have a team of passionate and dedicated people who are committed to building and evolving a cutting-edge platform for all creators and all fans. Our core values include:

• Execute with excellence
• Innovate aggressively  
• Deliver value, fast
• Take ownership
• Honesty & Transparency

We are here to help you make the most out of Fanview. If you have any questions, please don't hesitate to contact us. We are here to support you!`
    },
    {
      id: 'how-fanview-works',
      title: 'How does Fanview work?',
      updated: 'Updated over a year ago',
      excerpt: 'Understanding the subscription system and creator monetization',
      content: `At Fanview, content creators use a subscription system. They set their own prices and can charge subscribers every month (or longer). Subscribers get special access to the creator's content and can talk directly with them using Direct Messages.

While users can follow accounts for free, some content is only available to paying subscribers, not to free followers.

Creators on Fanview can make money in different ways. Subscriptions are the main income source, but they can also earn extra through tips, selling standalone content, pay-to-view messages, and more. In other words, they can make money in various ways, not just through subscriptions.

Fanview is home to a vast variety of content creators. These include influencers, NSFW creators, fitness models, musicians, and so many others.

You are able to use Fanview as a content creator or as someone who wants to access content and eventually become a subscriber. Fanview is a great platform for anyone that wants to share or view exclusive content made by talented people.

To use Fanview you must first register and create a User account. You must provide a valid email address and a password. Your password should be unique and must comply with the technical requirements of the Fanview site for the composition of passwords.`
    },
    {
      id: 'mobile-app',
      title: 'How to add Fanview as an app on your iOS or Android device',
      updated: 'Updated over 2 years ago',
      excerpt: 'Install Fanview as a web app on your mobile device',
      content: `Due to the strict terms and conditions of the App Store and Google Play Store, Fanview cannot create a mobile app. On the plus side, this allows us to keep Fanview up-to-date and on the latest version for you!

Fanview, however, is designed for both mobile and desktop use and optimised for both. You can even download an amazing Web App for your devices to quickly access Fanview from anywhere.

iPhone / iPad:
1. Open Safari on your iPhone and navigate to fanview.com
2. Tap on the "Share" icon at the bottom. This looks like a square with an arrow pointing upwards.
3. Select the "Add to Home Screen" icon.

Android:
1. Open Google Chrome and navigate to fanview.com
2. Tap on the "Options" icon. It may look like three vertical dots at the top.
3. Click "Add to Home Screen".

Now that you have the Fanview Web App on your device, you can easily access the platform with a single tap. You will also be able to receive notifications when new posts and updates are made. This makes staying up to date with Fanview even easier. With the Fanview Web App, you can experience Fanview on the go!`
    }
  ];

  const forFansArticles = [
    {
      id: 'payment-issues',
      title: 'Issues with adding a card or making a payment',
      updated: 'Updated over 3 months ago',
      excerpt: 'Common payment card failure reasons and solutions',
      content: `Below are the most common payment card failure reasons and their solutions:

Transaction declined by authorization system:
- This is a very vague reason that banks provide us, however, we do know that your bank has rejected the transaction
- Solution: Contact your bank; ask them to approve transactions to Fanview and "Whitelist" the merchant

Transaction declined (limit exceeded):
- Not enough available funds were available in your account to successfully make the purchase
- Solution: Add more funds to your account and try again

Transaction declined (suspecting manipulation):
- Your bank/issuer has declined the transaction as there is a suspected fraud on this credit card number
- Solution: Contact your bank; ask them to approve transactions to Fanview and "Whitelist" the merchant

What's 3DS?
3DS stands for 3D-Secure and it's a security protocol used by issuers to authenticate users when making Online Payments. Designed to prevent fraud and unauthorised transactions, 3DS presents the user with a prompt from their issuer requesting verification via either a mobile banking app or an online password request from the issuer.

I need further assistance!
Still having issues or have further questions? Reach out to our live support team at the bottom right of your screen.`
    },
    {
      id: 'no-bank-account',
      title: 'Can you use Fanview without a bank account?',
      updated: 'Updated over 2 years ago',
      excerpt: 'Using Fanview with debit or credit cards',
      content: `Yes, you can explore Fanview without needing a bank account. Payments to creators are done using a debit or credit card, which you can add by going to Settings > My Payment Cards.`
    },
    {
      id: 'payment-failures',
      title: '"Too many payment failures" Error',
      updated: 'Updated over 3 months ago',
      excerpt: 'Understanding and resolving payment failure errors',
      content: `If you receive the error "too many payment failures" when attempting to make a payment on Fanview, this is due to our fraud prevention detecting consecutive recurring payments on your account.

To resume making payments, please wait 10 minutes (cooldown time) for your account to be unblocked.`
    },
    {
      id: 'anonymous-fan',
      title: 'Can I be an anonymous fan on Fanview?',
      updated: 'Updated over 8 months ago',
      excerpt: 'Privacy and anonymity features for fans',
      content: `Absolutely! When you sign up, you are provided with a random username and account name. You can customize this at any time on your profile page. Creators you follow or subscribe to cannot see your email address; they can only see your pre-set or custom username and account name.

Can a creator see my card info?
No, all personal information, including card/bank details, is not accessible by a creator. Fanview complies with all laws, including PCI compliance, and does not hold or store customer card information. This is securely handled by our payment processor.`
    },
    {
      id: 'bank-statement',
      title: 'How Does Fanview Show Up on My Bank Statement?',
      updated: 'Updated over 8 months ago',
      excerpt: 'Discrete billing and privacy options',
      content: `At Fanview, we understand the importance of privacy for many of our users. To give you more control, we've introduced Discrete Billing – a feature that lets you customise how Fanview transactions appear on your bank statement.

What is Discrete Billing?
Discrete Billing is a feature available for payments made using bank cards or Primer. It allows you to change the default billing descriptor ("fanview.com") to a more neutral or discreet alternative.

How Can I Enable Discrete Billing?
1. Go to Settings in your Fanview account
2. Navigate to the Billing Preferences section
3. Toggle the Discrete Billing option to "On"
4. Select your preferred billing descriptor from the available options

Which Payment Methods Support Discrete Billing?
Discrete Billing is only available for payments made with bank cards. If you're using other payment methods like cryptocurrency or prepaid cards, Discrete Billing won't apply.`
    },
    {
      id: 'delete-account',
      title: 'How do I delete my Fanview Account?',
      updated: 'Updated over 2 years ago',
      excerpt: 'Account deletion process and considerations',
      content: `Deleting a Fanview account is permanent so please be sure this is the step you'd like to take before sending off the request.

Maybe a member of our support team can help resolve any issues you're facing? Feel free to reach out to us first via the live support icon in the bottom corner to speak with our team.

To delete your Fanview account, head to Settings > Account > Delete My Account and click "Delete".`
    }
  ];

  const categories = [
    {
      id: 'about',
      title: 'About Fanview',
      icon: Book,
      articles: aboutFanviewArticles,
      color: 'blue'
    },
    {
      id: 'fans',
      title: 'For Fans',
      icon: Users,
      articles: forFansArticles,
      color: 'purple'
    },
    {
      id: 'creators',
      title: 'For Creators',
      icon: Shield,
      articles: [],
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Fanview</span>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white font-poppins mb-4">
              How can we help you?
            </h1>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <AnimatedSection key={category.id} delay={0.1}>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-${category.color}-600/20 rounded-lg flex items-center justify-center`}>
                    <category.icon className={`w-6 h-6 text-${category.color}-400`} />
                  </div>
                  <h2 className="text-xl font-bold text-white font-poppins">
                    {category.title}
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {category.articles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/support/article/${article.id}`}
                      className="block p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <h3 className="text-white font-medium mb-1">
                        {article.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2">
                        {article.excerpt}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {article.updated}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
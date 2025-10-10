import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ArticlePage() {
  const { articleId } = useParams();

  // This would normally come from an API or database
  const articles: Record<string, any> = {
    'about-fanview': {
      title: 'About Fanview',
      updated: 'Updated over 3 months ago',
      content: `Fanview is a social subscription platform built and designed with leading creators to redefine the standards of how content creators share, earn and connect with their following. Our mission is to empower all creators to create, share and earn on a safe and secure platform. We believe great interactions take place on great platforms with great tech. We're committed to building and always evolving a cutting-edge platform for all creators and all fans.

At Fanview, we strive to provide creators and fans with the best experiences possible. We have a team of passionate and dedicated people who are committed to building and evolving a cutting-edge platform for all creators and all fans. Our core values include:

• Execute with excellence
• Innovate aggressively  
• Deliver value, fast
• Take ownership
• Honesty & Transparency

We are here to help you make the most out of Fanview. If you have any questions, please don't hesitate to contact us. We are here to support you!`
    },
    'how-fanview-works': {
      title: 'How does Fanview work?',
      updated: 'Updated over a year ago',
      content: `At Fanview, content creators use a subscription system. They set their own prices and can charge subscribers every month (or longer). Subscribers get special access to the creator's content and can talk directly with them using Direct Messages.

While users can follow accounts for free, some content is only available to paying subscribers, not to free followers.

Creators on Fanview can make money in different ways. Subscriptions are the main income source, but they can also earn extra through tips, selling standalone content, pay-to-view messages, and more. In other words, they can make money in various ways, not just through subscriptions.

Fanview is home to a vast variety of content creators. These include influencers, NSFW creators, fitness models, musicians, and so many others.

You are able to use Fanview as a content creator or as someone who wants to access content and eventually become a subscriber. Fanview is a great platform for anyone that wants to share or view exclusive content made by talented people.

To use Fanview you must first register and create a User account. You must provide a valid email address and a password. Your password should be unique and must comply with the technical requirements of the Fanview site for the composition of passwords.`
    }
    // Add more articles as needed
  };

  const article = articles[articleId || ''];

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article not found</h1>
          <Link to="/support" className="text-blue-400 hover:text-blue-300">
            Back to Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/support"
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Support</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white font-poppins mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{article.updated}</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="prose prose-invert max-w-none">
            {article.content.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index} className="text-slate-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Play, Image as ImageIcon, FileText, Lock } from 'lucide-react';
import { Content } from '../../lib/supabase';

interface ContentGridProps {
  content: Content[];
  hasAccess: boolean;
}

export default function ContentGrid({ content, hasAccess }: ContentGridProps) {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-6 h-6" />;
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'text':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => (
        <div
          key={item.id}
          className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors relative"
        >
          {item.is_premium && !hasAccess && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Subscribe to view</p>
              </div>
            </div>
          )}

          <div className="aspect-video bg-gray-700 flex items-center justify-center">
            {item.content_type === 'image' && item.content_url ? (
              <img
                src={item.content_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">
                {getContentIcon(item.content_type)}
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-white font-semibold mb-2 line-clamp-1">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-gray-400 text-sm line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
              {item.is_premium && (
                <span className="bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded">
                  Premium
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
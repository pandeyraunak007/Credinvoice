import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { getBlogPost, getRelatedPosts } from '../../data/blogData';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPost(slug);
  const relatedPosts = getRelatedPosts(slug, 3);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-white transition">Blog</Link>
            <span>/</span>
            <span className="text-slate-500 truncate max-w-xs">{post.title}</span>
          </div>

          {/* Category & Meta */}
          <div className="flex items-center gap-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            <span className="text-slate-400 text-sm">{post.date}</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400 text-sm">{post.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-slate-400 mb-8">
            {post.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-4 pb-8 border-b border-slate-800">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold">
              C
            </div>
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-slate-400 text-sm">CredInvoice</p>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-invert prose-lg max-w-none">
            <MarkdownContent content={post.content} />
          </article>
        </div>
      </section>

      {/* Share & Tags */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-8 border-t border-b border-slate-800">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                in
              </a>
            </div>
            <Link
              to="/blog"
              className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-2"
            >
              &larr; Back to Blog
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-purple-600/10 rounded-3xl p-8 md:p-12 border border-cyan-500/20 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Cash Flow?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands of businesses using CredInvoice to access working capital faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-slate-900 px-8 py-4 rounded-xl font-medium hover:bg-slate-100 transition"
              >
                Get Started Free
              </Link>
              <Link
                to="/products"
                className="px-8 py-4 rounded-xl font-medium border border-slate-600 hover:bg-slate-800/50 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition"
                >
                  <div className="aspect-video bg-slate-800/50 flex items-center justify-center text-4xl">
                    {relatedPost.icon}
                  </div>
                  <div className="p-6">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mb-3 ${getCategoryColor(relatedPost.category)}`}>
                      {relatedPost.category}
                    </span>
                    <h3 className="font-semibold mb-2 group-hover:text-cyan-400 transition line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}

// Simple Markdown renderer
function MarkdownContent({ content }) {
  const lines = content.trim().split('\n');
  const elements = [];
  let currentList = [];
  let currentTable = { headers: [], rows: [], inTable: false };
  let key = 0;

  const processInlineMarkdown = (text) => {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:underline">$1</a>');
    // Code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-sm">$1</code>');
    return text;
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc pl-6 space-y-2 my-4">
          {currentList.map((item, i) => (
            <li key={i} className="text-slate-300" dangerouslySetInnerHTML={{ __html: processInlineMarkdown(item) }} />
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushTable = () => {
    if (currentTable.headers.length > 0) {
      elements.push(
        <div key={key++} className="overflow-x-auto my-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-700">
                {currentTable.headers.map((header, i) => (
                  <th key={i} className="text-left py-3 px-4 text-slate-300 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTable.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-800">
                  {row.map((cell, j) => (
                    <td key={j} className="py-3 px-4 text-slate-400">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = { headers: [], rows: [], inTable: false };
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Skip empty lines (but flush lists)
    if (!trimmedLine) {
      flushList();
      return;
    }

    // Table handling
    if (trimmedLine.startsWith('|')) {
      const cells = trimmedLine.split('|').filter(c => c.trim()).map(c => c.trim());

      if (trimmedLine.includes('---')) {
        // Separator row, skip
        return;
      }

      if (!currentTable.inTable) {
        currentTable.headers = cells;
        currentTable.inTable = true;
      } else {
        currentTable.rows.push(cells);
      }
      return;
    } else if (currentTable.inTable) {
      flushTable();
    }

    // Headers
    if (trimmedLine.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-3xl font-bold mt-8 mb-4">
          {trimmedLine.substring(2)}
        </h1>
      );
      return;
    }

    if (trimmedLine.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-2xl font-bold mt-8 mb-4">
          {trimmedLine.substring(3)}
        </h2>
      );
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-xl font-semibold mt-6 mb-3">
          {trimmedLine.substring(4)}
        </h3>
      );
      return;
    }

    // Horizontal rule
    if (trimmedLine === '---') {
      flushList();
      elements.push(<hr key={key++} className="border-slate-700 my-8" />);
      return;
    }

    // List items
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      currentList.push(trimmedLine.substring(2));
      return;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmedLine)) {
      currentList.push(trimmedLine.replace(/^\d+\.\s/, ''));
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={key++}
        className="text-slate-300 leading-relaxed my-4"
        dangerouslySetInnerHTML={{ __html: processInlineMarkdown(trimmedLine) }}
      />
    );
  });

  flushList();
  flushTable();

  return <>{elements}</>;
}

function getCategoryColor(category) {
  const colors = {
    'MSME Finance': 'bg-emerald-500/20 text-emerald-400',
    'Supply Chain': 'bg-blue-500/20 text-blue-400',
    'Invoice Financing': 'bg-purple-500/20 text-purple-400',
    'Industry Insights': 'bg-orange-500/20 text-orange-400',
    'Product Updates': 'bg-cyan-500/20 text-cyan-400',
    'Guides': 'bg-pink-500/20 text-pink-400',
  };
  return colors[category] || 'bg-slate-500/20 text-slate-400';
}

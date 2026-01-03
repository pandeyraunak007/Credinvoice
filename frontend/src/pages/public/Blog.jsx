import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { blogPosts, categories } from '../../data/blogData';

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(post => post.featured);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            CredInvoice{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Blog
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Insights on MSME financing, supply chain finance, invoice discounting,
            and building a stronger Indian economy.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <Link to={`/blog/${featuredPost.slug}`} className="block group">
              <div className="bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-purple-600/10 rounded-3xl p-8 md:p-12 border border-cyan-500/20 hover:border-cyan-500/40 transition">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                        Featured
                      </span>
                      <span className="text-slate-400 text-sm">{featuredPost.category}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-cyan-400 transition">
                      {featuredPost.title}
                    </h2>
                    <p className="text-slate-400 text-lg mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 text-sm">{featuredPost.date}</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-slate-500 text-sm">{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="aspect-video bg-slate-800/50 rounded-2xl flex items-center justify-center text-6xl">
                      {featuredPost.icon}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.filter(p => !p.featured).map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition hover:-translate-y-1"
              >
                <div className="aspect-video bg-slate-800/50 flex items-center justify-center text-5xl">
                  {post.icon}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-slate-500 text-xs">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">{post.date}</span>
                    <span className="text-cyan-400 text-sm group-hover:translate-x-1 transition inline-flex items-center gap-1">
                      Read more &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/30 rounded-3xl p-8 md:p-12 border border-slate-700/50 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Get the latest insights on supply chain finance, MSME growth strategies,
              and industry trends delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
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

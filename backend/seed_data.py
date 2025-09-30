#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import Base, User, Category, Tool, Blog, Review, StaticPage, SiteSettings, Newsletter, FreeTool
from auth import get_password_hash
import uuid
from datetime import datetime

def create_seed_data():
    """Create seed data for development"""
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Seed data already exists. Skipping...")
            return
        
        print("Creating seed data...")
        
        # Create Super Admin
        superadmin = User(
            id=str(uuid.uuid4()),
            email="superadmin@marketmind.com",
            username="superadmin",
            hashed_password=get_password_hash("admin123"),
            full_name="Super Administrator",
            role="superadmin",
            bio="Platform super administrator"
        )
        db.add(superadmin)
        
        # Create Admin
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@marketmind.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Site Administrator",
            role="admin",
            bio="Site content administrator"
        )
        db.add(admin)
        
        # Create Test Users
        users = []
        for i in range(5):
            user = User(
                id=str(uuid.uuid4()),
                email=f"user{i+1}@example.com",
                username=f"user{i+1}",
                hashed_password=get_password_hash("password123"),
                full_name=f"Test User {i+1}",
                role="user",
                bio=f"I'm test user {i+1}, passionate about productivity tools and technology."
            )
            users.append(user)
            db.add(user)
        
        # Create Categories
        categories = []
        
        # Main categories
        productivity_cat = Category(
            id=str(uuid.uuid4()),
            name="Productivity",
            slug="productivity",
            description="Tools to boost your productivity and efficiency",
            seo_title="Best Productivity Tools 2024",
            seo_description="Discover the best productivity tools to enhance your workflow and get more done.",
            seo_keywords="productivity tools, efficiency, workflow, organization"
        )
        categories.append(productivity_cat)
        
        design_cat = Category(
            id=str(uuid.uuid4()),
            name="Design",
            slug="design",
            description="Creative design tools and resources",
            seo_title="Top Design Tools for Creatives",
            seo_description="Professional design tools for graphic designers, UI/UX designers, and creatives.",
            seo_keywords="design tools, graphics, ui design, creative software"
        )
        categories.append(design_cat)
        
        marketing_cat = Category(
            id=str(uuid.uuid4()),
            name="Marketing",
            slug="marketing",
            description="Digital marketing and automation tools",
            seo_title="Best Marketing Automation Tools",
            seo_description="Marketing tools to automate campaigns, analyze data, and grow your business.",
            seo_keywords="marketing tools, automation, campaigns, analytics"
        )
        categories.append(marketing_cat)
        
        ai_cat = Category(
            id=str(uuid.uuid4()),
            name="AI & Machine Learning",
            slug="ai-machine-learning",
            description="AI-powered tools and machine learning platforms",
            seo_title="AI Tools for Business and Development",
            seo_description="Cutting-edge AI tools and machine learning platforms for modern businesses.",
            seo_keywords="ai tools, machine learning, artificial intelligence, automation"
        )
        categories.append(ai_cat)
        
        # Add subcategories
        task_mgmt = Category(
            id=str(uuid.uuid4()),
            name="Task Management",
            slug="task-management",
            description="Tools for managing tasks and projects",
            parent_id=productivity_cat.id,
            seo_title="Best Task Management Software",
            seo_description="Compare the best task management tools for teams and individuals.",
            seo_keywords="task management, project management, productivity"
        )
        categories.append(task_mgmt)
        
        graphic_design = Category(
            id=str(uuid.uuid4()),
            name="Graphic Design",
            slug="graphic-design",
            description="Graphic design software and tools",
            parent_id=design_cat.id,
            seo_title="Professional Graphic Design Software",
            seo_description="Top graphic design tools used by professional designers worldwide.",
            seo_keywords="graphic design, design software, creative tools"
        )
        categories.append(graphic_design)
        
        for cat in categories:
            db.add(cat)
        
        db.flush()  # Get IDs
        
        # Create Tools
        tools = [
            {
                "name": "Notion",
                "description": "Notion is an all-in-one workspace that combines note-taking, document sharing, wikis, and project management. It's designed to be the single space where you can think, write, and plan.",
                "short_description": "All-in-one workspace for notes, docs, and project management",
                "url": "https://notion.so",
                "pricing_type": "freemium",
                "features": ["Note-taking", "Project management", "Database", "Wiki", "Templates", "Collaboration"],
                "pros": ["Highly customizable", "Great for teams", "Powerful database features", "Rich formatting options"],
                "cons": ["Learning curve", "Can be slow with large databases", "Mobile app limitations"],
                "categories": [productivity_cat.id, task_mgmt.id],
                "pricing_details": {
                    "free": "Personal use with blocks limit",
                    "plus": "$8/month per user",
                    "business": "$15/month per user"
                }
            },
            {
                "name": "Figma",
                "description": "Figma is a collaborative web application for interface design, with additional offline features enabled by desktop applications. It features vector graphics editing and prototyping tools.",
                "short_description": "Collaborative interface design tool",
                "url": "https://figma.com",
                "pricing_type": "freemium",
                "features": ["Vector editing", "Prototyping", "Real-time collaboration", "Design systems", "Plugins", "Developer handoff"],
                "pros": ["Web-based", "Excellent collaboration", "Great for teams", "Powerful prototyping"],
                "cons": ["Requires internet", "Limited offline features", "Performance with complex files"],
                "categories": [design_cat.id, graphic_design.id],
                "pricing_details": {
                    "free": "Up to 3 projects",
                    "professional": "$12/month per user",
                    "organization": "$45/month per user"
                }
            },
            {
                "name": "Slack",
                "description": "Slack is a business communication platform offering many IRC-style features, including persistent chat rooms organized by topic, private groups, and direct messaging.",
                "short_description": "Team communication and collaboration platform",
                "url": "https://slack.com",
                "pricing_type": "freemium",
                "features": ["Channels", "Direct messaging", "File sharing", "Video calls", "App integrations", "Search"],
                "pros": ["Great for team communication", "Extensive integrations", "Easy to use", "Mobile apps"],
                "cons": ["Can be distracting", "Expensive for large teams", "Message history limits on free plan"],
                "categories": [productivity_cat.id],
                "pricing_details": {
                    "free": "10,000 recent messages",
                    "pro": "$7.25/month per user",
                    "business": "$12.50/month per user"
                }
            },
            {
                "name": "Canva",
                "description": "Canva is a graphic design platform that allows users to create social media graphics, presentations, posters, documents and other visual content.",
                "short_description": "Online graphic design platform for everyone",
                "url": "https://canva.com",
                "pricing_type": "freemium",
                "features": ["Templates", "Drag-and-drop editor", "Stock photos", "Brand kit", "Team collaboration", "Publishing tools"],
                "pros": ["User-friendly", "Great templates", "Affordable", "No design experience needed"],
                "cons": ["Limited customization", "Subscription for premium features", "Generic designs"],
                "categories": [design_cat.id, graphic_design.id, marketing_cat.id],
                "pricing_details": {
                    "free": "Basic features",
                    "pro": "$12.99/month",
                    "teams": "$14.99/month per user"
                }
            },
            {
                "name": "ChatGPT",
                "description": "ChatGPT is an AI chatbot developed by OpenAI that uses natural language processing to engage in human-like conversations and assist with various tasks.",
                "short_description": "AI-powered conversational assistant",
                "url": "https://chat.openai.com",
                "pricing_type": "freemium",
                "features": ["Natural conversation", "Code generation", "Writing assistance", "Problem solving", "Research help", "Multiple languages"],
                "pros": ["Highly intelligent", "Versatile", "Great for brainstorming", "Fast responses"],
                "cons": ["Can provide inaccurate info", "Usage limits on free tier", "No real-time data"],
                "categories": [ai_cat.id, productivity_cat.id],
                "pricing_details": {
                    "free": "GPT-3.5 with limits",
                    "plus": "$20/month",
                    "team": "$25/month per user"
                }
            },
            {
                "name": "Trello",
                "description": "Trello is a web-based Kanban-style list-making application. It's a subsidiary of Atlassian, developed for project management and personal use.",
                "short_description": "Kanban-style project management tool",
                "url": "https://trello.com",
                "pricing_type": "freemium",
                "features": ["Kanban boards", "Cards and lists", "Team collaboration", "Power-ups", "Automation", "Templates"],
                "pros": ["Simple and intuitive", "Great for visual learners", "Free tier is generous", "Good mobile apps"],
                "cons": ["Limited reporting", "Not suitable for complex projects", "Basic time tracking"],
                "categories": [productivity_cat.id, task_mgmt.id],
                "pricing_details": {
                    "free": "Up to 10 team boards",
                    "standard": "$5/month per user",
                    "premium": "$10/month per user"
                }
            }
        ]
        
        tool_objects = []
        for i, tool_data in enumerate(tools):
            # Generate slug
            slug = tool_data["name"].lower().replace(" ", "-")
            
            tool = Tool(
                id=str(uuid.uuid4()),
                name=tool_data["name"],
                slug=slug,
                description=tool_data["description"],
                short_description=tool_data["short_description"],
                url=tool_data["url"],
                pricing_type=tool_data["pricing_type"],
                pricing_details=tool_data["pricing_details"],
                features=tool_data["features"],
                pros=tool_data["pros"],
                cons=tool_data["cons"],
                rating=4.0 + (i * 0.2),  # Vary ratings
                review_count=10 + (i * 5),
                view_count=100 + (i * 50),
                trending_score=50.0 + (i * 10),
                is_featured=i < 3,  # First 3 tools are featured
                seo_title=f"{tool_data['name']} - {tool_data['short_description']}",
                seo_description=tool_data["description"][:150] + "...",
                seo_keywords=f"{tool_data['name'].lower()}, {tool_data['short_description'].lower()}"
            )
            
            db.add(tool)
            tool_objects.append((tool, tool_data["categories"]))
        
        db.flush()  # Get tool IDs
        
        # Assign categories to tools
        for tool, category_ids in tool_objects:
            tool_categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
            tool.categories = tool_categories
        
        # Create sample reviews
        for i, (tool, _) in enumerate(tool_objects[:3]):  # Reviews for first 3 tools
            for j, user in enumerate(users[:3]):  # Reviews from first 3 users
                review = Review(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    tool_id=tool.id,
                    rating=4 + (j % 2),  # 4 or 5 stars
                    title=f"Great tool for {tool.name}",
                    content=f"I've been using {tool.name} for a few months now and it's been fantastic. Highly recommend it for anyone looking for a reliable solution.",
                    pros=["Easy to use", "Great features", "Good value"],
                    cons=["Could use more integrations"] if j == 0 else [],
                    is_verified=True
                )
                db.add(review)
        
        # Create sample blogs
        blog_data = [
            {
                "title": "Top 10 Productivity Tools for Remote Teams in 2024",
                "content": """
                <h1>Top 10 Productivity Tools for Remote Teams in 2024</h1>
                
                <p>Remote work has become the new normal, and having the right tools is crucial for maintaining productivity and collaboration. In this comprehensive guide, we'll explore the top 10 productivity tools that are making waves in 2024.</p>
                
                <h2>1. Communication Tools</h2>
                <p>Effective communication is the backbone of any successful remote team. Tools like Slack and Microsoft Teams have revolutionized how we collaborate...</p>
                
                <h2>2. Project Management Solutions</h2>
                <p>Keeping track of tasks and deadlines is more challenging when your team is distributed. That's where tools like Notion, Trello, and Asana come in...</p>
                
                <h2>3. Design and Creative Tools</h2>
                <p>Creative collaboration doesn't have to suffer in a remote environment. Figma has shown us that real-time design collaboration is not only possible but can be even better than in-person...</p>
                
                <h2>Conclusion</h2>
                <p>The right combination of tools can make remote work not just viable, but more productive than traditional office environments. The key is finding the tools that work best for your team's specific needs.</p>
                """,
                "author": users[0],
                "tags": ["productivity", "remote work", "tools", "2024"],
                "status": "published"
            },
            {
                "title": "Figma vs Adobe XD: Which Design Tool is Right for You?",
                "content": """
                <h1>Figma vs Adobe XD: Which Design Tool is Right for You?</h1>
                
                <p>The design tool landscape has evolved significantly over the past few years. Two tools that have emerged as leaders are Figma and Adobe XD. But which one should you choose?</p>
                
                <h2>Collaboration Features</h2>
                <p>Figma's real-time collaboration features set it apart from the competition. Multiple designers can work on the same file simultaneously...</p>
                
                <h2>Pricing Comparison</h2>
                <p>When it comes to pricing, both tools offer competitive options, but there are some key differences...</p>
                
                <h2>Learning Curve</h2>
                <p>Both tools are relatively easy to learn, but they have different approaches to interface design...</p>
                
                <h2>Final Verdict</h2>
                <p>Choose Figma if collaboration is a priority. Choose Adobe XD if you're already invested in the Adobe ecosystem.</p>
                """,
                "author": users[1],
                "tags": ["design", "figma", "adobe xd", "comparison"],
                "status": "published"
            },
            {
                "title": "The Rise of AI Tools in Content Creation",
                "content": """
                <h1>The Rise of AI Tools in Content Creation</h1>
                
                <p>Artificial Intelligence has transformed many industries, and content creation is no exception. From writing assistance to image generation, AI tools are becoming indispensable for creators.</p>
                
                <h2>AI Writing Assistants</h2>
                <p>Tools like ChatGPT and Jasper have revolutionized how we approach writing. They can help with brainstorming, drafting, and even editing content...</p>
                
                <h2>Image Generation</h2>
                <p>DALL-E, Midjourney, and Stable Diffusion have made it possible for anyone to create stunning visuals with just a text prompt...</p>
                
                <h2>The Future of AI in Creative Work</h2>
                <p>As AI continues to evolve, we can expect even more sophisticated tools that will augment human creativity rather than replace it...</p>
                """,
                "author": users[2],
                "tags": ["ai", "content creation", "writing", "creativity"],
                "status": "published",
                "is_ai_generated": True
            }
        ]
        
        for blog_info in blog_data:
            slug = blog_info["title"].lower().replace(" ", "-").replace(":", "").replace("?", "")
            
            blog = Blog(
                id=str(uuid.uuid4()),
                title=blog_info["title"],
                slug=slug,
                content=blog_info["content"],
                excerpt=blog_info["content"][:200] + "...",
                author_id=blog_info["author"].id,
                status=blog_info["status"],
                tags=blog_info["tags"],
                is_ai_generated=blog_info.get("is_ai_generated", False),
                reading_time=5,
                view_count=100,
                seo_title=blog_info["title"],
                seo_description=blog_info["content"][:150] + "...",
                seo_keywords=", ".join(blog_info["tags"]),
                published_at=datetime.utcnow() if blog_info["status"] == "published" else None
            )
            db.add(blog)
        
        db.commit()
        
        # Create Static Pages
        static_pages = [
            {
                "page_key": "about",
                "title": "About MarketMind AI",
                "content": """
                <h1>About MarketMind AI</h1>
                
                <p>MarketMind AI is your ultimate destination for discovering, comparing, and choosing the best business tools. We're passionate about helping businesses and individuals make informed decisions about the tools that power their productivity and growth.</p>
                
                <h2>Our Mission</h2>
                <p>We believe that having the right tools can make all the difference in achieving success. Our mission is to provide a comprehensive platform where you can:</p>
                <ul>
                    <li>Discover innovative tools across all categories</li>
                    <li>Read authentic reviews from real users</li>
                    <li>Compare features, pricing, and capabilities side-by-side</li>
                    <li>Make data-driven decisions with AI-powered insights</li>
                </ul>
                
                <h2>What Makes Us Different</h2>
                <p>Unlike other tool directories, MarketMind AI combines human expertise with artificial intelligence to provide you with:</p>
                <ul>
                    <li><strong>AI-Powered Recommendations:</strong> Our intelligent algorithms help match you with tools that fit your specific needs</li>
                    <li><strong>Verified Reviews:</strong> All reviews go through our verification process to ensure authenticity</li>
                    <li><strong>Comprehensive Comparisons:</strong> Compare up to 5 tools side-by-side with detailed feature breakdowns</li>
                    <li><strong>Expert Content:</strong> Our team creates in-depth guides and analyses to help you understand each tool</li>
                </ul>
                
                <h2>Our Team</h2>
                <p>MarketMind AI is built by a team of productivity enthusiasts, software engineers, and business experts who understand the challenges of finding the right tools in today's crowded market.</p>
                
                <p>We're constantly working to improve our platform and add new features that make your tool discovery journey even better.</p>
                
                <h2>Join Our Community</h2>
                <p>Be part of a growing community of 10,000+ professionals who trust MarketMind AI for their tool discovery needs. Share your experiences, learn from others, and help shape the future of business productivity.</p>
                """,
                "meta_description": "Learn about MarketMind AI - your ultimate destination for discovering and comparing the best business tools with AI-powered insights."
            },
            {
                "page_key": "contact",
                "title": "Contact Us",
                "content": """
                <h1>Contact MarketMind AI</h1>
                
                <p>We'd love to hear from you! Whether you have questions, feedback, or want to collaborate with us, don't hesitate to get in touch.</p>
                
                <h2>Get in Touch</h2>
                <div class="contact-info">
                    <p><strong>Email:</strong> hello@marketmind.ai</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p><strong>Address:</strong> San Francisco, CA, United States</p>
                </div>
                
                <h2>Business Inquiries</h2>
                <p>For partnership opportunities, tool submissions, or business collaborations:</p>
                <p><strong>Business Email:</strong> partnerships@marketmind.ai</p>
                
                <h2>Support</h2>
                <p>Need help with your account or have technical issues?</p>
                <p><strong>Support Email:</strong> support@marketmind.ai</p>
                
                <h2>Media & Press</h2>
                <p>For media inquiries and press releases:</p>
                <p><strong>Press Email:</strong> press@marketmind.ai</p>
                
                <h2>Follow Us</h2>
                <p>Stay updated with the latest news and updates:</p>
                <ul>
                    <li><a href="https://twitter.com/marketmindai" target="_blank">Twitter</a></li>
                    <li><a href="https://linkedin.com/company/marketmind" target="_blank">LinkedIn</a></li>
                    <li><a href="https://github.com/marketmind" target="_blank">GitHub</a></li>
                    <li><a href="https://discord.gg/marketmind" target="_blank">Discord</a></li>
                </ul>
                
                <h2>Office Hours</h2>
                <p>Our team is available Monday through Friday, 9:00 AM to 6:00 PM PST.</p>
                
                <p><em>We typically respond to all inquiries within 24 hours.</em></p>
                """,
                "meta_description": "Contact MarketMind AI for support, partnerships, or any questions about our business tools platform."
            },
            {
                "page_key": "privacy",
                "title": "Privacy Policy",
                "content": """
                <h1>Privacy Policy</h1>
                <p><em>Last updated: December 2024</em></p>
                
                <p>At MarketMind AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
                
                <h2>Information We Collect</h2>
                
                <h3>Personal Information</h3>
                <p>We may collect personal information that you provide to us, including:</p>
                <ul>
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Account credentials (username, password)</li>
                    <li>Profile information and bio</li>
                    <li>Reviews and comments you post</li>
                    <li>Communication preferences</li>
                </ul>
                
                <h3>Usage Information</h3>
                <p>We automatically collect certain information when you use our services:</p>
                <ul>
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent, clicks)</li>
                    <li>Cookies and similar tracking technologies</li>
                </ul>
                
                <h2>How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process your account registration and manage your profile</li>
                    <li>Send you newsletters and marketing communications (with your consent)</li>
                    <li>Respond to your comments, questions, and customer service requests</li>
                    <li>Analyze usage patterns and improve user experience</li>
                    <li>Prevent fraud and ensure security</li>
                </ul>
                
                <h2>Information Sharing</h2>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:</p>
                <ul>
                    <li>To service providers who help us operate our platform</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or acquisition</li>
                </ul>
                
                <h2>Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is 100% secure.</p>
                
                <h2>Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>Access, update, or delete your personal information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request a copy of your data</li>
                    <li>Lodge a complaint with a supervisory authority</li>
                </ul>
                
                <h2>Cookies</h2>
                <p>We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize content. You can control cookie settings through your browser preferences.</p>
                
                <h2>Third-Party Links</h2>
                <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.</p>
                
                <h2>Children's Privacy</h2>
                <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
                
                <h2>Changes to This Policy</h2>
                <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.</p>
                
                <h2>Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <p>Email: privacy@marketmind.ai<br>
                Address: San Francisco, CA, United States</p>
                """,
                "meta_description": "MarketMind AI Privacy Policy - Learn how we collect, use, and protect your personal information."
            },
            {
                "page_key": "terms",
                "title": "Terms of Service",
                "content": """
                <h1>Terms of Service</h1>
                <p><em>Last updated: December 2024</em></p>
                
                <p>Welcome to MarketMind AI. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using MarketMind AI, you agree to be bound by these Terms.</p>
                
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                
                <h2>2. Use License</h2>
                <p>Permission is granted to temporarily download one copy of the materials on MarketMind AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul>
                    <li>modify or copy the materials;</li>
                    <li>use the materials for any commercial purpose or for any public display;</li>
                    <li>attempt to reverse engineer any software contained on the website;</li>
                    <li>remove any copyright or other proprietary notations from the materials.</li>
                </ul>
                
                <h2>3. User Accounts</h2>
                <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for maintaining the confidentiality of your account.</p>
                
                <h2>4. User Content</h2>
                <p>Our service may allow you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content"). You are responsible for the Content that you post to the service, including its legality, reliability, and appropriateness.</p>
                
                <h2>5. Prohibited Uses</h2>
                <p>You may not use our service:</p>
                <ul>
                    <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                    <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                    <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                    <li>To submit false or misleading information</li>
                    <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                </ul>
                
                <h2>6. Intellectual Property Rights</h2>
                <p>The service and its original content, features and functionality are and will remain the exclusive property of MarketMind AI and its licensors. The service is protected by copyright, trademark, and other laws.</p>
                
                <h2>7. Reviews and Ratings</h2>
                <p>Users may post reviews and ratings for tools. All reviews must be honest, factual, and based on your actual experience with the tool. We reserve the right to remove reviews that violate these guidelines.</p>
                
                <h2>8. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                
                <h2>9. Disclaimer</h2>
                <p>The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, MarketMind AI excludes all representations, warranties, conditions and terms relating to our website and the use of this website.</p>
                
                <h2>10. Limitation of Liability</h2>
                <p>In no event shall MarketMind AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
                
                <h2>11. Governing Law</h2>
                <p>These Terms shall be interpreted and governed by the laws of the State of California, USA.</p>
                
                <h2>12. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
                
                <h2>13. Contact Information</h2>
                <p>If you have any questions about these Terms of Service, please contact us at:</p>
                <p>Email: legal@marketmind.ai<br>
                Address: San Francisco, CA, United States</p>
                """,
                "meta_description": "MarketMind AI Terms of Service - Read our terms and conditions for using our business tools platform."
            }
        ]
        
        for page_data in static_pages:
            page = StaticPage(
                id=str(uuid.uuid4()),
                page_key=page_data["page_key"],
                title=page_data["title"],
                content=page_data["content"],
                meta_description=page_data["meta_description"],
                is_published=True
            )
            db.add(page)
        
        # Create Site Settings
        site_settings = [
            {
                "setting_key": "company_name",
                "setting_value": "MarketMind AI",
                "setting_type": "text",
                "description": "Company name displayed on the site",
                "is_public": True
            },
            {
                "setting_key": "contact_email",
                "setting_value": "hello@marketmind.ai",
                "setting_type": "email",
                "description": "Main contact email address",
                "is_public": True
            },
            {
                "setting_key": "contact_address",
                "setting_value": "San Francisco, CA, United States",
                "setting_type": "text",
                "description": "Company address",
                "is_public": True
            },
            {
                "setting_key": "github_url",
                "setting_value": "https://github.com/marketmind",
                "setting_type": "url",
                "description": "GitHub profile URL",
                "is_public": True
            },
            {
                "setting_key": "linkedin_url",
                "setting_value": "https://linkedin.com/company/marketmind",
                "setting_type": "url",
                "description": "LinkedIn company page URL",
                "is_public": True
            },
            {
                "setting_key": "twitter_url",
                "setting_value": "https://twitter.com/marketmindai",
                "setting_type": "url",
                "description": "Twitter/X profile URL",
                "is_public": True
            },
            {
                "setting_key": "discord_url",
                "setting_value": "https://discord.gg/marketmind",
                "setting_type": "url",
                "description": "Discord server invitation URL",
                "is_public": True
            },
            {
                "setting_key": "phone_number",
                "setting_value": "+1 (555) 123-4567",
                "setting_type": "text",
                "description": "Contact phone number",
                "is_public": True
            },
            {
                "setting_key": "support_email",
                "setting_value": "support@marketmind.ai",
                "setting_type": "email",
                "description": "Support email address",
                "is_public": True
            },
            {
                "setting_key": "business_email",
                "setting_value": "partnerships@marketmind.ai",
                "setting_type": "email",
                "description": "Business partnerships email",
                "is_public": True
            }
        ]
        
        for setting_data in site_settings:
            setting = SiteSettings(
                id=str(uuid.uuid4()),
                **setting_data
            )
            db.add(setting)
        
        # Create sample newsletter subscriptions
        newsletter_subscriptions = [
            {"email": "user1@example.com", "name": "John Doe", "is_confirmed": True},
            {"email": "user2@example.com", "name": "Jane Smith", "is_confirmed": True},
            {"email": "subscriber1@test.com", "name": "Alex Johnson", "is_confirmed": True},
            {"email": "subscriber2@test.com", "name": "Sarah Wilson", "is_confirmed": False},
            {"email": "tester@marketmind.ai", "name": "Test User", "is_confirmed": True}
        ]
        
        for sub_data in newsletter_subscriptions:
            newsletter = Newsletter(
                id=str(uuid.uuid4()),
                email=sub_data["email"],
                name=sub_data["name"],
                is_active=True,
                is_confirmed=sub_data["is_confirmed"],
                confirmed_at=datetime.utcnow() if sub_data["is_confirmed"] else None,
                source="seed_data"
            )
            db.add(newsletter)
        
        # Create Free Tools
        free_tools_data = [
            {
                "name": "Google Analytics",
                "description": "Free web analytics service that tracks and reports website traffic",
                "url": "https://analytics.google.com",
                "category": "Analytics",
                "is_featured": True,
                "order_index": 1
            },
            {
                "name": "Canva Free",
                "description": "Free version of the popular graphic design platform",
                "url": "https://canva.com",
                "category": "Design",
                "is_featured": True,
                "order_index": 2
            },
            {
                "name": "GitHub",
                "description": "Free code repository hosting and version control",
                "url": "https://github.com",
                "category": "Development",
                "is_featured": True,
                "order_index": 3
            },
            {
                "name": "MailChimp Free",
                "description": "Free email marketing platform for small businesses",
                "url": "https://mailchimp.com",
                "category": "Marketing",
                "is_featured": True,
                "order_index": 4
            },
            {
                "name": "Trello",
                "description": "Free project management tool with Kanban boards",
                "url": "https://trello.com",
                "category": "Productivity",
                "is_featured": True,
                "order_index": 5
            },
            {
                "name": "Google Drive",
                "description": "Free cloud storage and document collaboration",
                "url": "https://drive.google.com",
                "category": "Storage",
                "order_index": 6
            },
            {
                "name": "Slack Free",
                "description": "Free team communication and collaboration platform",
                "url": "https://slack.com",
                "category": "Communication",
                "order_index": 7
            },
            {
                "name": "HubSpot CRM",
                "description": "Free customer relationship management software",
                "url": "https://hubspot.com",
                "category": "CRM",
                "order_index": 8
            },
            {
                "name": "Zoom Basic",
                "description": "Free video conferencing software",
                "url": "https://zoom.us",
                "category": "Communication",
                "order_index": 9
            },
            {
                "name": "Buffer Free",
                "description": "Free social media scheduling and management tool",
                "url": "https://buffer.com",
                "category": "Marketing",
                "order_index": 10
            }
        ]
        
        for tool_data in free_tools_data:
            free_tool = FreeTool(
                id=str(uuid.uuid4()),
                name=tool_data["name"],
                description=tool_data["description"],
                url=tool_data["url"],
                category=tool_data["category"],
                is_featured=tool_data.get("is_featured", False),
                is_active=True,
                order_index=tool_data["order_index"]
            )
            db.add(free_tool)
        
        db.commit()
        print("✅ Seed data created successfully!")
        print("\n📝 Login credentials:")
        print("Super Admin: superadmin@marketmind.com / admin123")
        print("Admin: admin@marketmind.com / admin123")
        print("User: user1@example.com / password123")
        
    except Exception as e:
        print(f"❌ Error creating seed data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
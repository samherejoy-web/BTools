#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
from models import Base, User, Category, Tool, Blog, Review
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
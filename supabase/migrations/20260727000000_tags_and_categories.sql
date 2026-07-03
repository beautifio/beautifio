-- Migration: Tags system + 9 categories (add opinion + news)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Seed content tags (for auto-suggest) — only if key doesn't exist
INSERT INTO app_settings (key, value)
VALUES ('content_tags', '[
"mental-health","self-care","mindfulness","burnout","overthinking","anxiety",
"self-love","journaling","meditation","productivity","sleep","stress",
"healing","therapy","self-awareness","growth-mindset","resilience",
"confidence","self-esteem","emotional-intelligence","trauma","boundaries",
"skincare","makeup","fashion","outfit-ideas","beauty","haircare",
"body-care","glow-up","personal-style","fragrance","nail-art",
"career","job-interview","resume","networking","entrepreneurship",
"freelancing","side-hustle","salary","time-management","public-speaking",
"leadership","personal-branding","linkedin","internship","scholarship",
"financial-literacy","investasi","bisnis",
"friendship","dating","family","communication","toxic-relationship",
"breakup","long-distance","love-language","conflict","social-anxiety",
"parents","siblings",
"writing","design","art","drawing","photography","music",
"crafting","diy","journal","bullet-journal","content-creation","creative-block",
"coding","programming","game-development","ai","tech-career",
"gadgets","gaming","esports","mobile-gaming","pc-gaming",
"cybersecurity","web-development","app-development","digital-literacy",
"food","cooking","recipe","restaurant-review","cafe-hopping","culinary",
"street-food","korean-food","japanese-food","movies","film-review",
"k-drama","anime","concert","travel","staycation",
"budget-travel","solo-travel","weekend-activities",
"current-events","social-issues","climate-change","education-reform",
"gender-equality","digital-privacy","lingkungan","sustainability",
"kesehatan-publik","literasi-digital","hoax","demokrasi",
"anak-muda-bersuara","kebijakan-publik","ekonomi","budaya-populer",
"berita","news","update","event","kebijakan",
"penelitian","riset","data","statistik","infografis",
"announcement","lomba","webinar","conference",
"pemerintah","startup",
"fitness","gym","workout","running","yoga","pilates","calisthenics",
"weightlifting","basketball","football","futsal","badminton",
"swimming","martial-arts","boxing","home-workout","gym-beginner","sports-nutrition"
]')
ON CONFLICT (key) DO NOTHING;

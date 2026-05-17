"""
Test du système de recommandation - à lancer depuis scraping-service root
python test_recommendation.py
"""

import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
root = Path(__file__).parent.parent.parent
env_path = root / ".env"
if env_path.exists():
    load_dotenv(env_path)

from api.main import _calculate_matching_score

def test_scoring():
    """Test la fonction de scoring avec différents cas"""
    
    print("=" * 70)
    print("TEST SYSTÈME DE RECOMMANDATION")
    print("=" * 70)
    
    print("\n[Test 1] Match de compétences")
    offre1 = {
        "titre": "Senior Python Developer",
        "competences": ["Python", "React", "TypeScript", "PostgreSQL"],
        "niveau_experience": "senior",
        "description": "Join our team...",
        "company_about": "We are...",
    }
    
    score1 = _calculate_matching_score(
        offre1, 
        user_skills=["Python", "React", "Java"],
        user_experience="senior"
    )
    print(f"  Offre: {offre1['titre']}")
    print(f"  Skills utilisateur: ['Python', 'React', 'Java']")
    print(f"  Skills offre: {offre1['competences']}")
    print(f"  Experience: senior")
    print(f"   Score: {score1}/100")
    assert score1 > 60, f"Expected > 60, got {score1}"
    
    print("\n[Test 2] Pas de match")
    offre2 = {
        "titre": "Go Developer",
        "competences": ["Go", "Rust", "C++"],
        "niveau_experience": "junior",
    }
    
    score2 = _calculate_matching_score(
        offre2,
        user_skills=["Python", "React"],
        user_experience="senior"
    )
    print(f"  Offre: {offre2['titre']}")
    print(f"  Skills utilisateur: ['Python', 'React']")
    print(f"  Skills offre: {offre2['competences']}")
    print(f"   Score: {score2}/100")
    
    print("\n[Test 3] Aucun profil utilisateur")
    score3 = _calculate_matching_score(offre1)
    print(f"  user_skills: None, user_experience: None")
    print(f"   Score (devrait être 0): {score3}/100")
    assert score3 == 0, f"Expected 0, got {score3}"
    
    print("\n[Test 4] Match partiel (mid-level)")
    offre4 = {
        "titre": "Mid-level JavaScript Developer",
        "competences": ["JavaScript", "React", "Node.js"],
        "niveau_experience": "mid",
        "description": "Good offer",
    }
    
    score4 = _calculate_matching_score(
        offre4,
        user_skills=["JavaScript", "Python"],
        user_experience="mid"
    )
    print(f"  Offre: {offre4['titre']}")
    print(f"  Skills utilisateur: ['JavaScript', 'Python']")
    print(f"  Skills offre: {offre4['competences']}")
    print(f"  Experience: mid")
    print(f"   Score: {score4}/100")
    
    print("\n[Test 5] Bonus qualité (description + company_about)")
    offre5 = {
        "titre": "Python Developer",
        "competences": ["Python"],
        "niveau_experience": "junior",
        "description": "Detailed description here...",
        "company_about": "Company info...",
    }
    
    score5a = _calculate_matching_score(
        offre5,
        user_skills=["Python"],
        user_experience="junior"
    )
    
    offre5b = {**offre5, "description": None, "company_about": None}
    score5b = _calculate_matching_score(
        offre5b,
        user_skills=["Python"],
        user_experience="junior"
    )
    
    print(f"  Offre 1 (avec description + company): Score {score5a}")
    print(f"  Offre 2 (sans description + company): Score {score5b}")
    print(f"   Différence (bonus): {score5a - score5b}")
    assert score5a > score5b, "Offre avec description devrait avoir score plus élevé"
    
    print("\n" + "=" * 70)
    print(" TOUS LES TESTS PASSENT!")
    print("=" * 70)

if __name__ == "__main__":
    test_scoring()


#!/usr/bin/env python3
"""
CSV Import Script for Word Profiles
Imports word profiles from CSV into Supabase word_profiles table
"""

import csv
import json
import os
import sys
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Supabase connection details
SUPABASE_DB_URL = "postgresql://postgres.sehrwrwkrwyibxlicpsy:YOUR_DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

def connect_to_database():
    """Connect to Supabase PostgreSQL database"""
    try:
        conn = psycopg2.connect(SUPABASE_DB_URL)
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        sys.exit(1)

def parse_json_field(value: str, default: Dict[str, Any] = None) -> Dict[str, Any]:
    """Safely parse JSON field from CSV"""
    if not value or value.strip() == '':
        return default or {}
    
    try:
        # Handle escaped JSON strings
        if value.startswith('"') and value.endswith('"'):
            value = value[1:-1].replace('""', '"')
        
        return json.loads(value)
    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse JSON: {value[:50]}... Error: {e}")
        return default or {}

def process_word_row(row: Dict[str, str]) -> Dict[str, Any]:
    """Process a single CSV row into word profile format"""
    
    # Basic word info
    word_data = {
        'word': row.get('word', '').strip(),
    }
    
    # Morpheme breakdown
    morpheme_breakdown = {}
    if row.get('prefix_text'):
        morpheme_breakdown['prefix'] = {
            'text': row.get('prefix_text', ''),
            'meaning': row.get('prefix_meaning', ''),
            'origin': row.get('prefix_origin', '')
        }
    
    morpheme_breakdown['root'] = {
        'text': row.get('root_text', row.get('word', '')),
        'meaning': row.get('root_meaning', '')
    }
    
    if row.get('suffix_text'):
        morpheme_breakdown['suffix'] = {
            'text': row.get('suffix_text', ''),
            'meaning': row.get('suffix_meaning', ''),
            'origin': row.get('suffix_origin', '')
        }
    
    word_data['morpheme_breakdown'] = morpheme_breakdown
    
    # Etymology
    etymology = {
        'historical_origins': row.get('historical_origins', ''),
        'language_of_origin': row.get('language_of_origin', ''),
        'word_evolution': row.get('word_evolution', ''),
        'cultural_regional_variations': row.get('cultural_regional_variations', '')
    }
    word_data['etymology'] = etymology
    
    # Definitions
    definitions = {
        'primary': row.get('primary_definition', ''),
        'standard': [d.strip() for d in row.get('standard_definitions', '').split('|') if d.strip()],
        'extended': [d.strip() for d in row.get('extended_definitions', '').split('|') if d.strip()],
        'contextual': row.get('contextual_definition', ''),
        'specialized': row.get('specialized_definition', '')
    }
    word_data['definitions'] = definitions
    
    # Word forms
    word_forms = {
        'base_form': row.get('base_form', ''),
        'verb_tenses': {
            'present': row.get('present_tense', ''),
            'past': row.get('past_tense', ''),
            'future': row.get('future_tense', ''),
            'present_participle': row.get('present_participle', ''),
            'past_participle': row.get('past_participle', ''),
            'other': row.get('other_tenses', '')
        },
        'noun_forms': {
            'singular': row.get('singular_form', ''),
            'plural': row.get('plural_form', '')
        },
        'adjective_forms': {
            'positive': row.get('positive_form', ''),
            'comparative': row.get('comparative_form', ''),
            'superlative': row.get('superlative_form', '')
        },
        'adverb_form': row.get('adverb_form', ''),
        'other_inflections': row.get('other_inflections', '')
    }
    word_data['word_forms'] = word_forms
    
    # Analysis
    analysis = {
        'parts_of_speech': row.get('parts_of_speech', ''),
        'tenses_voice_mood': row.get('tenses_voice_mood', ''),
        'articles_determiners': row.get('articles_determiners', ''),
        'sentence_positions': row.get('sentence_positions', ''),
        'sentence_structure': row.get('sentence_structure', ''),
        'contextual_usage': row.get('contextual_usage', ''),
        'synonyms_antonyms': row.get('synonyms_antonyms', ''),
        'common_collocations': row.get('common_collocations', ''),
        'cultural_historical_significance': row.get('cultural_historical_significance', ''),
        'example': row.get('example_sentence', '')
    }
    word_data['analysis'] = analysis
    
    return word_data

def import_csv(file_path: str) -> None:
    """Import word profiles from CSV file"""
    conn = connect_to_database()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    success_count = 0
    error_count = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, row in enumerate(reader, 1):
                try:
                    word_data = process_word_row(row)
                    
                    if not word_data['word']:
                        logger.warning(f"Row {row_num}: Missing word, skipping")
                        error_count += 1
                        continue
                    
                    # Insert into database
                    insert_query = """
                        INSERT INTO public.word_profiles 
                        (word, morpheme_breakdown, etymology, definitions, word_forms, analysis)
                        VALUES (%(word)s, %(morpheme_breakdown)s, %(etymology)s, %(definitions)s, %(word_forms)s, %(analysis)s)
                        ON CONFLICT (word) DO UPDATE SET
                            morpheme_breakdown = EXCLUDED.morpheme_breakdown,
                            etymology = EXCLUDED.etymology,
                            definitions = EXCLUDED.definitions,
                            word_forms = EXCLUDED.word_forms,
                            analysis = EXCLUDED.analysis,
                            updated_at = NOW()
                    """
                    
                    cursor.execute(insert_query, {
                        'word': word_data['word'],
                        'morpheme_breakdown': json.dumps(word_data['morpheme_breakdown']),
                        'etymology': json.dumps(word_data['etymology']),
                        'definitions': json.dumps(word_data['definitions']),
                        'word_forms': json.dumps(word_data['word_forms']),
                        'analysis': json.dumps(word_data['analysis'])
                    })
                    
                    success_count += 1
                    logger.info(f"Row {row_num}: Successfully imported '{word_data['word']}'")
                    
                except Exception as e:
                    error_count += 1
                    logger.error(f"Row {row_num}: Error importing word - {e}")
                    continue
        
        conn.commit()
        logger.info(f"Import completed: {success_count} successful, {error_count} errors")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Import failed: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def create_sample_csv():
    """Create a sample CSV file with the expected format"""
    sample_data = [
        {
            'word': 'superfluous',
            'prefix_text': 'super-',
            'prefix_meaning': 'above, over, beyond',
            'prefix_origin': 'Latin',
            'root_text': 'flu',
            'root_meaning': 'to flow',
            'suffix_text': '-ous',
            'suffix_meaning': 'having the quality of',
            'suffix_origin': 'Latin',
            'historical_origins': 'From Latin superfluus meaning "overflowing, unnecessary"',
            'language_of_origin': 'Latin',
            'word_evolution': 'Originally meant "overflowing", evolved to mean "excessive" or "unnecessary"',
            'cultural_regional_variations': 'Used similarly across English-speaking regions',
            'primary_definition': 'unnecessary, especially through being more than enough',
            'standard_definitions': 'excessive|unnecessary|redundant',
            'extended_definitions': 'beyond what is required|wastefully abundant',
            'contextual_definition': 'In formal writing, refers to elements that add no value',
            'specialized_definition': 'In logic, refers to premises that do not affect the conclusion',
            'base_form': 'superfluous',
            'present_tense': '',
            'past_tense': '',
            'future_tense': '',
            'present_participle': '',
            'past_participle': '',
            'other_tenses': '',
            'singular_form': '',
            'plural_form': '',
            'positive_form': 'superfluous',
            'comparative_form': 'more superfluous',
            'superlative_form': 'most superfluous',
            'adverb_form': 'superfluously',
            'other_inflections': 'superfluity (noun)',
            'parts_of_speech': 'adjective',
            'tenses_voice_mood': 'N/A (adjective)',
            'articles_determiners': 'a superfluous detail, the superfluous information',
            'sentence_positions': 'attributive and predicative positions',
            'sentence_structure': 'can modify nouns directly or follow linking verbs',
            'contextual_usage': 'formal writing, academic contexts, criticism',
            'synonyms_antonyms': 'synonyms: unnecessary, excessive, redundant; antonyms: necessary, essential, required',
            'common_collocations': 'superfluous detail, superfluous information, superfluous to requirements',
            'cultural_historical_significance': 'Often used in literary criticism and formal analysis',
            'example_sentence': 'The lengthy introduction seemed superfluous to the main argument.'
        }
    ]
    
    with open('sample_word_profiles.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = list(sample_data[0].keys())
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(sample_data)
    
    logger.info("Created sample_word_profiles.csv")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python csv_import.py <csv_file_path>")
        print("       python csv_import.py --create-sample")
        sys.exit(1)
    
    if sys.argv[1] == "--create-sample":
        create_sample_csv()
    else:
        csv_file = sys.argv[1]
        if not os.path.exists(csv_file):
            logger.error(f"File not found: {csv_file}")
            sys.exit(1)
        
        import_csv(csv_file)

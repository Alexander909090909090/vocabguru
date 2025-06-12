
# Word Profiles CSV Import

This script imports word profiles from CSV files into the Supabase word_profiles table.

## Requirements

```bash
pip install psycopg2-binary
```

## Setup

1. Update the database URL in `csv_import.py`:
   ```python
   SUPABASE_DB_URL = "postgresql://postgres.sehrwrwkrwyibxlicpsy:YOUR_DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
   ```

2. Replace `YOUR_DB_PASSWORD` with your actual Supabase database password.

## CSV Format

The CSV should have the following columns:

### Basic Info
- `word` - The word itself (required)

### Morpheme Breakdown
- `prefix_text` - Prefix text (optional)
- `prefix_meaning` - Prefix meaning (optional)
- `prefix_origin` - Prefix origin (optional)
- `root_text` - Root word text (required)
- `root_meaning` - Root meaning (optional)
- `suffix_text` - Suffix text (optional)
- `suffix_meaning` - Suffix meaning (optional)
- `suffix_origin` - Suffix origin (optional)

### Etymology
- `historical_origins` - Historical background
- `language_of_origin` - Source language
- `word_evolution` - How the word evolved
- `cultural_regional_variations` - Cultural variations

### Definitions
- `primary_definition` - Main definition
- `standard_definitions` - Multiple definitions separated by `|`
- `extended_definitions` - Extended definitions separated by `|`
- `contextual_definition` - Context-specific meaning
- `specialized_definition` - Technical/specialized meaning

### Word Forms
- `base_form` - Base form of the word
- `present_tense`, `past_tense`, `future_tense` - Verb tenses
- `present_participle`, `past_participle` - Participles
- `other_tenses` - Other tense forms
- `singular_form`, `plural_form` - Noun forms
- `positive_form`, `comparative_form`, `superlative_form` - Adjective forms
- `adverb_form` - Adverb form
- `other_inflections` - Other word forms

### Analysis
- `parts_of_speech` - Grammatical categories
- `tenses_voice_mood` - Verb characteristics
- `articles_determiners` - Usage with articles
- `sentence_positions` - Where it appears in sentences
- `sentence_structure` - Structural usage
- `contextual_usage` - Context of use
- `synonyms_antonyms` - Related words
- `common_collocations` - Common word pairs
- `cultural_historical_significance` - Cultural importance
- `example_sentence` - Example usage

## Usage

### Create a sample CSV:
```bash
python csv_import.py --create-sample
```

### Import from CSV:
```bash
python csv_import.py your_word_profiles.csv
```

## Example CSV Row

```csv
word,prefix_text,prefix_meaning,root_text,root_meaning,suffix_text,suffix_meaning,primary_definition,example_sentence
superfluous,super-,above/over,flu,to flow,-ous,having quality of,unnecessary through being more than enough,The lengthy introduction seemed superfluous to the main argument.
```

## Error Handling

- Duplicate words will be updated with new data
- Invalid JSON fields will be skipped with warnings
- Missing required fields will cause row to be skipped
- Detailed logging shows progress and errors

## Batch Import Tips

- Test with a small sample first
- Check logs for any parsing errors
- Ensure your CSV is UTF-8 encoded
- Use `|` as separator for multiple values in definition fields

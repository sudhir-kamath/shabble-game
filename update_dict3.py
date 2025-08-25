#!/usr/bin/env python3
"""
Script to extract all 3-letter words from CSW24 WORDS.txt and update DICTIONARY_3 in dictionary.js
"""

import re

def extract_3_letter_words(csw24_file):
    """Extract all 3-letter words from CSW24 file"""
    three_letter_words = []
    
    with open(csw24_file, 'r', encoding='utf-8') as f:
        for line in f:
            word = line.strip().upper()
            if len(word) == 3 and word.isalpha():
                three_letter_words.append(word.lower())
    
    return sorted(three_letter_words)

def format_js_array(words, words_per_line=16):
    """Format words as JavaScript array with proper indentation"""
    formatted_lines = []
    
    for i in range(0, len(words), words_per_line):
        chunk = words[i:i + words_per_line]
        formatted_words = [f"'{word}'" for word in chunk]
        
        if i + words_per_line >= len(words):
            # Last line - no comma at end
            line = "    " + ", ".join(formatted_words)
        else:
            # Not last line - add comma
            line = "    " + ", ".join(formatted_words) + ","
            
        formatted_lines.append(line)
    
    return formatted_lines

def update_dictionary_js(js_file, three_letter_words):
    """Update the DICTIONARY_3 array in dictionary.js"""
    
    # Read the current file
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Format the new array
    formatted_lines = format_js_array(three_letter_words)
    new_array = "// Dictionary of valid 3-letter words (from CSW24)\nconst DICTIONARY_3 = [\n" + \
                "\n".join(formatted_lines) + "\n];"
    
    # Replace the DICTIONARY_3 array using regex
    pattern = r'// Dictionary of valid 3-letter words.*?const DICTIONARY_3 = \[.*?\];'
    
    if re.search(pattern, content, re.DOTALL):
        updated_content = re.sub(pattern, new_array, content, flags=re.DOTALL)
    else:
        print("Could not find DICTIONARY_3 pattern in file")
        return False
    
    # Write the updated content back
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    return True

def main():
    csw24_file = "CSW24 WORDS.txt"
    js_file = "js/dictionary.js"
    
    print("Extracting 3-letter words from CSW24 WORDS.txt...")
    three_letter_words = extract_3_letter_words(csw24_file)
    
    print(f"Found {len(three_letter_words)} three-letter words")
    
    print("Updating dictionary.js...")
    success = update_dictionary_js(js_file, three_letter_words)
    
    if success:
        print(f"Successfully updated DICTIONARY_3 with {len(three_letter_words)} words")
        print("First 10 words:", three_letter_words[:10])
        print("Last 10 words:", three_letter_words[-10:])
    else:
        print("Failed to update dictionary.js")

if __name__ == "__main__":
    main()

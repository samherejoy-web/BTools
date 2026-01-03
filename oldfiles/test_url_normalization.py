#!/usr/bin/env python3
"""
Test script for URL normalization functionality
"""
import sys
import os
sys.path.append('/app/backend')

from utils.url_normalizer import normalize_url, validate_url_format, get_display_url

def test_url_normalization():
    """Test URL normalization functions"""
    test_cases = [
        # (input_url, expected_normalized)
        ("https://www.example.com", "example.com"),
        ("http://www.example.com", "example.com"),
        ("https://example.com", "example.com"),
        ("http://example.com", "example.com"),
        ("www.example.com", "example.com"),
        ("https://www.example.com/path", "example.com/path"),
        ("http://www.example.com/path/", "example.com/path"),
        ("HTTPS://WWW.EXAMPLE.COM", "example.com"),
        ("", ""),
        (None, None),
    ]
    
    print("🧪 Testing URL Normalization:")
    print("-" * 50)
    
    for i, (input_url, expected) in enumerate(test_cases, 1):
        try:
            result = normalize_url(input_url)
            status = "✅ PASS" if result == expected else "❌ FAIL"
            print(f"{i:2d}. {status} | Input: '{input_url}' | Expected: '{expected}' | Got: '{result}'")
        except Exception as e:
            print(f"{i:2d}. ❌ ERROR | Input: '{input_url}' | Error: {e}")
    
    print("\n🧪 Testing URL Validation:")
    print("-" * 50)
    
    valid_urls = [
        "https://example.com",
        "http://example.com",
        "www.example.com",
        "example.com",
        "subdomain.example.com",
        "example.co.uk",
        ""  # Empty should be valid (optional field)
    ]
    
    invalid_urls = [
        "invalid-url",
        "just-text",
        "ftp://example.com",  # Not http/https
        "example",  # No TLD
    ]
    
    print("Valid URLs:")
    for url in valid_urls:
        result = validate_url_format(url)
        status = "✅ VALID" if result else "❌ INVALID"
        print(f"  {status} | '{url}'")
    
    print("\nInvalid URLs:")
    for url in invalid_urls:
        result = validate_url_format(url)
        status = "❌ INVALID" if not result else "✅ VALID (Unexpected)"
        print(f"  {status} | '{url}'")
    
    print("\n🧪 Testing Display URL:")
    print("-" * 50)
    
    display_test_cases = [
        ("https://www.example.com", "example.com"),
        ("https://example.com/path", "example.com/path"),
        ("www.example.com", "example.com"),
    ]
    
    for input_url, expected in display_test_cases:
        result = get_display_url(input_url)
        status = "✅ PASS" if result == expected else "❌ FAIL"
        print(f"  {status} | Input: '{input_url}' | Expected: '{expected}' | Got: '{result}'")

if __name__ == "__main__":
    test_url_normalization()
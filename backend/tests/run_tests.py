#!/usr/bin/env python3
"""
Organized test runner for the audiobook project
Usage: python tests/run_tests.py [test_category]
"""
import os
import sys
import subprocess
import argparse

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_tests(test_category=None, coverage=False, verbose=False):
    """Run tests with specified parameters"""
    
    # Set Django settings
    os.environ['DJANGO_SETTINGS_MODULE'] = 'auth.test_settings'
    
    # Base command
    cmd = ['python', 'manage.py', 'test']
    
    # Test selection
    if test_category:
        test_modules = {
            'models': 'tests.test_models',
            'views': 'tests.test_views', 
            'integration': 'tests.test_integration',
            'all': 'tests'
        }
        
        if test_category in test_modules:
            cmd.append(test_modules[test_category])
        else:
            print(f"❌ Unknown test category: {test_category}")
            print(f"Available categories: {list(test_modules.keys())}")
            return False
    else:
        cmd.append('tests')  # Run all tests in tests package
    
    # Add settings
    cmd.extend(['--settings=auth.test_settings'])
    
    # Verbosity
    if verbose:
        cmd.extend(['--verbosity=2'])
    else:
        cmd.extend(['--verbosity=1'])
    
    # Coverage wrapper
    if coverage:
        cmd = ['coverage', 'run', '--source=.'] + cmd[1:]
    
    print(f"🚀 Running command: {' '.join(cmd)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, check=True)
        
        if coverage:
            print("\n📊 Generating coverage report...")
            subprocess.run(['coverage', 'report', '-m'])
            subprocess.run(['coverage', 'html'])
            print("📄 HTML report generated in htmlcov/")
        
        print("\n✅ Tests completed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Tests failed with exit code {e.returncode}")
        return False
    except FileNotFoundError as e:
        print(f"❌ Command not found: {e}")
        print("💡 Make sure you're in the backend directory and have Django installed")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Run audiobook project tests')
    parser.add_argument(
        'category', 
        nargs='?', 
        choices=['models', 'views', 'integration', 'all'],
        help='Test category to run (default: all)'
    )
    parser.add_argument(
        '--coverage', 
        action='store_true',
        help='Run with coverage report'
    )
    parser.add_argument(
        '--verbose', 
        action='store_true',
        help='Verbose output'
    )
    
    args = parser.parse_args()
    
    print("🧪 Django Audiobook Project - Test Runner")
    print("=" * 50)
    
    success = run_tests(
        test_category=args.category,
        coverage=args.coverage,
        verbose=args.verbose
    )
    
    if not success:
        sys.exit(1)

if __name__ == '__main__':
    main()
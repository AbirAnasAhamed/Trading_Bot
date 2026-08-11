import subprocess
import sys
import os

# Get the directory where verify_all.py is located
script_dir = os.path.dirname(os.path.abspath(__file__))
scripts = ["verify_db.py", "verify_redis.py", "verify_api.py", "verify_celery.py"]

def run_all():
    print("====================================")
    print("  Running All Verification Scripts  ")
    print("====================================\n")
    
    all_passed = True
    
    for script in scripts:
        print(f"--- Running {script} ---")
        try:
            script_path = os.path.join(script_dir, script)
            result = subprocess.run([sys.executable, script_path])
            if result.returncode != 0:
                all_passed = False
        except Exception as e:
            print(f"[FAIL] Failed to run {script}: {e}")
            all_passed = False
        print("\n")
        
    if all_passed:
        print("[SUCCESS] All systems are GO! No problems detected.")
    else:
        print("[WARNING] Some verifications failed. Please check the logs above.")

if __name__ == "__main__":
    run_all()

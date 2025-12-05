import logging
import time
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def check_job_postings(platform, url, auth_token):
    try:
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        logging.info(f"Checked {platform} job postings. Found {len(response.json())} opportunities.")
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error checking {platform} job postings: {str(e)}")
        return None

def apply_for_job(platform, job_id, auth_token):
    try:
        headers = {'Authorization': f'Bearer {auth_token}'}
        data = {'action': 'apply', 'job_id': job_id}
        response = requests.post(f"https://{platform}.com/api/apply", headers=headers, json=data, timeout=10)
        response.raise_for_status()
        logging.info(f"Successfully applied for job {job_id} on {platform}.")
        return True
    except requests.exceptions.RequestException as e:
        logging.error(f"Error applying for job on {platform}: {str(e)}")
        return False

def main():
    platforms = [
        {'name': 'Upwork', 'url': 'https://api.upwork.com/v2/jobs', 'token': 'upwork_token_123'},
        {'name': 'Fiverr', 'url': 'https://api.fiverr.com/v2/projects', 'token': 'fiverr_token_456'},
        {'name': 'Zhihu', 'url': 'https://api.zhihu.com/v2/works', 'token': 'zhihu_token_789'},
        {'name': 'Bilibili', 'url': 'https://api.bilibili.com/v2/video', 'token': 'bilibili_token_012'}
    ]

    for platform in platforms:
        logging.info(f"Starting {platform['name']} check...")
        job_listings = check_job_postings(platform['name'], platform['url'], platform['token'])
        if job_listings and len(job_listings) > 0:
            for job in job_listings[:3]:  # Apply to first 3 jobs
                if apply_for_job(platform['name'], job['id'], platform['token']):
                    time.sleep(2)  # Respectful delay between requests
        time.sleep(5)  # Respectful delay between platform checks

if __name__ == "__main__":
    main()
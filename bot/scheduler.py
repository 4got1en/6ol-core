#!/usr/bin/env python3
"""
Temple Scheduler
Manages scheduling and execution of temple operations
"""

import schedule
import time
from datetime import datetime
import threading
import logging
try:
    from .pattern_whisper import whisper_weekly_tremors
except ImportError:
    # Handle case when run as script
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from pattern_whisper import whisper_weekly_tremors

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('TempleScheduler')

class TempleScheduler:
    """Main scheduler for temple operations"""
    
    def __init__(self):
        self.running = False
        self.scheduler_thread = None
        
    def setup_schedules(self):
        """Setup all scheduled operations"""
        logger.info("Setting up temple schedules...")
        
        # Schedule weekly tremor analysis every Sunday at 9:00 AM
        schedule.every().sunday.at("09:00").do(self._run_weekly_tremors)
        
        # Add other schedules here as needed
        logger.info("All schedules configured")
    
    def _run_weekly_tremors(self):
        """Wrapper for weekly tremor analysis with error handling"""
        try:
            logger.info("Starting weekly tremor analysis...")
            result = whisper_weekly_tremors()
            logger.info(f"Weekly tremor analysis completed: {result}")
        except Exception as e:
            logger.error(f"Error in weekly tremor analysis: {e}")
    
    def start(self):
        """Start the scheduler"""
        if self.running:
            logger.warning("Scheduler is already running")
            return
            
        self.setup_schedules()
        self.running = True
        
        def run_scheduler():
            logger.info("Temple Scheduler started")
            while self.running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            logger.info("Temple Scheduler stopped")
        
        self.scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        self.scheduler_thread.start()
        
    def stop(self):
        """Stop the scheduler"""
        if not self.running:
            return
            
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("Temple Scheduler shutdown complete")
    
    def status(self):
        """Get scheduler status"""
        jobs = schedule.jobs
        return {
            "running": self.running,
            "jobs_count": len(jobs),
            "next_run": schedule.next_run().isoformat() if jobs else None,
            "jobs": [str(job) for job in jobs]
        }
    
    def run_now(self, job_name):
        """Manually trigger a specific job"""
        if job_name == "weekly_tremors":
            self._run_weekly_tremors()
        else:
            logger.error(f"Unknown job: {job_name}")

# Global scheduler instance
temple_scheduler = TempleScheduler()

def start_temple_scheduler():
    """Start the global temple scheduler"""
    temple_scheduler.start()

def stop_temple_scheduler():
    """Stop the global temple scheduler"""
    temple_scheduler.stop()

if __name__ == "__main__":
    # Demo/test mode
    logger.info("Starting Temple Scheduler in demo mode...")
    temple_scheduler.start()
    
    try:
        # Run for a short time in demo mode
        time.sleep(10)
        
        # Show status
        status = temple_scheduler.status()
        logger.info(f"Scheduler status: {status}")
        
        # Test manual run
        logger.info("Testing manual tremor analysis...")
        temple_scheduler.run_now("weekly_tremors")
        
    except KeyboardInterrupt:
        logger.info("Demo interrupted by user")
    finally:
        temple_scheduler.stop()
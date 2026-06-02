import { describe, it, expect } from '../../../test/test-harness.js';
import {TimeSeriesDb} from './index.js';

  await describe('db/timeseries-db', async () => {
    await it('should store metrics, aggregate rolling windows, and fire alerts', () => {
      const tsdb = new TimeSeriesDb({ pruneInterval: 0 });
      let alertFired = false;
      tsdb.addAlertRule('cpu', 90, '>', (p) => {
        alertFired = true;
        expect(p.value).toBe(95);
      });

      const now = 1780394151000;
      tsdb.insert('cpu', 50, {}, now);
      tsdb.insert('cpu', 60, {}, now + 1000);
      tsdb.insert('cpu', 95, {}, now + 2000); // Triggers alert

      expect(alertFired).toBe(true);

      // Aggregations over 5-second windows
      const avg = tsdb.aggregate('cpu', 5000, 'mean', { start: now, end: now + 5000 });
      expect(avg.length).toBe(1);
      expect(avg[0].value).toBe(68.33333333333333); // (50 + 60 + 95)/3
      
      tsdb.destroy();
    });
  });

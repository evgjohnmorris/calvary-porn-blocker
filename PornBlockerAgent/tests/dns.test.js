const os = require('os');
const child_process = require('child_process');
const logger = require('../system/logger');
const dns = require('../system/dns');

jest.mock('os');
jest.mock('child_process');
jest.mock('../system/logger');

describe('DNS & DoH Hardening', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should skip applyDoHBlock on non-Windows platforms', async () => {
        os.platform.mockReturnValue('darwin');
        
        const result = await dns.applyDoHBlock();
        expect(result).toBe(true);
        expect(child_process.exec).not.toHaveBeenCalled();
    });

    it('should execute applyDoHBlock on Windows platforms', async () => {
        os.platform.mockReturnValue('win32');
        child_process.exec.mockImplementation((cmd, callback) => {
            callback(null, 'Success', '');
        });
        
        const result = await dns.applyDoHBlock();
        expect(result).toBe(true);
        expect(child_process.exec).toHaveBeenCalled();
    });

    it('should log audit event when DoH block execution fails', async () => {
        os.platform.mockReturnValue('win32');
        child_process.exec.mockImplementation((cmd, callback) => {
            callback(new Error('Permission Denied'), '', 'Error');
        });
        
        const result = await dns.applyDoHBlock();
        expect(result).toBe(false);
        expect(logger.logAudit).toHaveBeenCalledWith('doh_block_apply_failed', 'SYSTEM', 'Permission Denied');
    });

    it('should log audit event when removeDoHBlock execution fails', async () => {
        os.platform.mockReturnValue('win32');
        child_process.exec.mockImplementation((cmd, callback) => {
            callback(new Error('File not found'), '', 'Error');
        });
        
        const result = await dns.removeDoHBlock();
        expect(result).toBe(false);
        expect(logger.logAudit).toHaveBeenCalledWith('doh_block_remove_failed', 'SYSTEM', 'File not found');
    });
});

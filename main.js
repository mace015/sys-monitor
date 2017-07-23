const sysinfo = require('systeminformation');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

let screen = blessed.screen();
let grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

// Main title
let title = grid.set(0, 0, 1, 12, contrib.markdown);
title.setMarkdown("Welcome to sys-monitor! For more information about this tool, please visit http://github.com/mace015/sys-monitor");

// CPU stats
let cpuStats = grid.set(1, 0, 2, 6, contrib.donut, {
    label: 'CPU usage',
	radius: 8,
	arcWidth: 3,
	remainColor: 'black',
	yPadding: 2,
});

setInterval(() => {

    sysinfo.currentLoad().then(data => {
        let stats = [
            { percent: data.currentload, label: 'Average', color: 'green' },
        ];

        for (let i = 0; i < data.cpus.length; i++) {
            stats.push({ percent: data.cpus[i].load, label: 'Core ' + (i + 1), color: 'red' });
        }
        
        cpuStats.setData(stats);
        screen.render();
    });

}, 1000);

// Memory usage
let memStats = grid.set(1, 6, 2, 2, contrib.donut,  {
    label: 'Memory usage',
	radius: 8,
	arcWidth: 3,
	remainColor: 'black',
	yPadding: 2,
});

setInterval(() => {

    sysinfo.mem().then(data => {
        let total  = data.total / (1024 * 1024);
        let unit   = total / 100;
        let active = data.active / (1024 * 1024);
        let memory = active / unit;
        
        memStats.setData([
            { percent: memory, label: (Math.round((active) * 100) / 100) +' mb / '+ Math.round(total) +' mb', color: 'green' },
        ]);

        screen.render();
    });

}, 1000);

// Swap usage
let swapStats = grid.set(1, 8, 2, 2, contrib.donut,  {
    label: 'Swap usage',
	radius: 8,
	arcWidth: 3,
	remainColor: 'black',
	yPadding: 2,
});

setInterval(() => {

    sysinfo.mem().then(data => {
        let swapTotal  = data.swaptotal / (1024 * 1024);
        let swapUnit   = swapTotal / 100;
        let swapActive = data.swapused / (1024 * 1024);
        let swapMemory = swapActive / swapUnit;
        
        swapStats.setData([
            { percent: swapMemory, label: (Math.round((swapActive) * 100) / 100) +' mb / '+ Math.round(swapTotal) +' mb', color: 'red' }
        ]);

        screen.render();
    });

}, 1000);

// System information
let information = grid.set(1, 10, 2, 2, contrib.table, {
    label: 'General system information',
    columnWidth: [10, 10]
});

setInterval(() => {

    sysinfo.osInfo().then(data => {
        information.setData({
            headers: ['', ''],
            data: [
                ['Platform', data.platform],
                ['Distro', data.distro],
                ['Release', data.release],
                ['Codename', data.codename],
                ['Kernel', data.kernel],
                ['Hostname', data.hostname],
            ]
        });

        screen.render();
    });

}, 1000);

// Storage information
let storage = grid.set(3, 0, 2, 5, contrib.table, {
    label: 'Storage',
    columnWidth: [15, 15, 15, 15, 15, 15],
    columnSpacing: 5,
});

setInterval(() => {

    sysinfo.fsSize().then(data => {
        let disks = [];
        for (let i = 0; i < data.length; i++) {
            let disk = data[i];
            disks.push([
                disk.fs,
                disk.type,
                Math.round((disk.size / (1024 * 1024 * 1024)) * 1000) / 1000,
                Math.round((disk.used / (1024 * 1024 * 1024)) * 1000) / 1000,
                disk.use,
                disk.mount
            ]);
        }

        storage.setData({
            headers: ['Name', 'Type', 'Size (gb)', 'Used (gb)', 'Used in %', 'Mount point'],
            data: disks
        });

        screen.render();
    });

}, 1000);

// User information
let userInfo = grid.set(3, 5, 2, 5, contrib.table, {
    label: 'Active users',
    columnWidth: [25, 25, 25],
    columnSpacing: 5,
});

setInterval(() => {

    sysinfo.users().then(data => {
        let users = [];
        for (let i = 0; i < data.length; i++) {
            let user = data[i];
            users.push([
                user.user,
                user.tty,
                user.date + ' ' + user.time
            ]);
        }

        userInfo.setData({
            headers: ['Username', 'Terminal', 'Last login'],
            data: users
        });

        screen.render();
    });

}, 1000);

// Network activity
let network = grid.set(3, 10, 2, 2, contrib.table, {
    label: 'Network activity',
    columnWidth: [25, 15]
});

setInterval(() => {

    sysinfo.networkInterfaceDefault().then(data => {
        return Promise.all([
            sysinfo.networkStats(data),
            sysinfo.inetLatency()
        ]);
    }).then(data => {
        network.setData({
            headers: ['', ''],
            data: [
                ['Total incomming (mb)', Math.round((data[0].rx / (1024 * 1024)) * 100) / 100],
                ['Total outgoing (mb)', Math.round((data[0].tx / (1024 * 1024)) * 100) / 100],
                ['Latency to 8.8.8.8 (ms)', data[1]],
            ]
        });

        screen.render();
    });

}, 1000);

// Processes information
let procInfo = grid.set(5, 0, 7, 10, contrib.table, {
    label: 'Active processes (sleeping processes excluded)',
    columnWidth: [25, 25, 25, 25, 25, 25, 25],
});

setInterval(() => {

    sysinfo.processes().then(data => {
        let procs = [];
        for (let i = 0; i < data.list.length; i++) {
            let proc = data.list[i];
            if (proc.state != 'sleeping') {
                procs.push([
                    proc.pid,
                    Math.round((proc.pcpu) * 100) / 100,
                    Math.round((proc.pmem) * 100) / 100,
                    Math.round((proc.mem_vsz / (1024 * 1024)) * 100) / 100,
                    proc.started,
                    proc.state,
                    proc.user,
                ]);
            }
        }

        procInfo.setData({
            headers: ['PID', 'CPU %', 'RAM %', 'Memory size (mb)', 'Started', 'Status', 'User'],
            data: procs
        });

        screen.render();
    });

}, 1000);

screen.render();
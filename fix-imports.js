import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace `import React from 'react';`
    content = content.replace(/import React from 'react';\r?\n?/g, '');
    // Replace `import React, {` with `import {`
    content = content.replace(/import React,\s*\{/g, 'import {');
    
    if(content !== original) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

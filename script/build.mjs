import * as esbuild from 'esbuild'
import { exec as callback_exec } from 'child_process'
import { chdir } from 'process'
import { promises as fs } from 'fs'
import util from 'util'
const exec = util.promisify(callback_exec)


let debug, serve;

for (let arg of process.argv) {
    switch (arg) {
        case "--serve":
            serve = true
            break
        case "--debug":
            debug = true
            break
    }
}

let ctx = await esbuild.context({
    entryPoints: ['./src/index.js'],
    bundle: true,
    outdir: './dist/script',
    sourcemap: !!debug,
    define: {'window.DEBUG': "" + debug}
})


async function buildPrereqs() {
    chdir('./src/mathquill')
    await exec('make dev')
    console.log('Mathquill done')
    
    chdir('../editor.js')
    await exec('npm run build')
    console.log('Editor.js done')
    
    chdir('../..')
    await fs.copyFile('./src/mathquill/build/mathquill.js', './src/mathquill.js')
    console.log('Files copied')
}

await buildPrereqs()
esbuild.build({
    entryPoints: ['./src/mathquill.js'],
    outdir: './dist/script',
    globalName: 'Mathquill'
})
esbuild.build({
    entryPoints: ['./src/jquery.js'],
    outdir: 'dist/script',
    globalName: '$'
})


if (serve) {
    await ctx.watch()

    let { host, port } = await ctx.serve({
        servedir: './dist',
        keyfile: './test/your.key',
        certfile: './test/your.cert'
    })
}
else {
    await ctx.rebuild()
    ctx.dispose()
}
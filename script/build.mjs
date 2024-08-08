import * as esbuild from 'esbuild'
import { exec } from 'child_process'
import { chdir } from 'process'
import { promises as fs } from 'fs'

// async function build() {
//     console.log(await esbuild.build({
//         entryPoints: ['./src/index.js'],
//         bundle: true,
//         outdir: './dist',
//         minify: true,
//         sourcemap: true,
//         target: ['es2015'],
//     }))
// }

let ctx = await esbuild.context({
    entryPoints: ['./src/index.js'],
    bundle: true,
    outdir: './dist',
    sourcemap: true
})

chdir('./src/mathquill')
exec('make', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error building mathquill: ${error.message}`)
        return;
    }

    if (stderr) {
        console.error(`Mathquill make stderr: ${stderr}`)
        return;
    }

    console.log(`Mathquill build stdout: ${stdout}`)
})

chdir('../editor.js')
exec('npm run build', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error building editorjs: ${error.message}`)
        return;
    }

    if (stderr) {
        console.error(`Editorjs stderr: ${stderr}`)
        return;
    }

    console.log(`Editorjs build stdout: ${stdout}`)
})

chdir('../..')
await fs.copyFile('./src/mathquill/build/mathquill.js', './dist/mathquill.js')

if (process.argv[2] == '--serve') {
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
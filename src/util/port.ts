// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? Port checker for NodeJS side
//  ! Cannot use in browser
//
import tcpPortUsed from 'tcp-port-used'

/**
 * Prevent use port which it's already use by other program
 * @param start Port start number
 * @returns The available port
 */
export const PortAvailable = async (start:number) => {
    let port_result = start
    let canbeuse = false
    while(!canbeuse){
        await tcpPortUsed.check(port_result).then(x => {
            canbeuse = !x
        }).catch(err => {
            canbeuse = true
        })
        if(!canbeuse) port_result += 1
    }
    return port_result
}

// config/index.tsx

import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { flareCoston2 } from './other-networks'

// Get projectId from https://cloud.reown.com
export const projectId = '7e9d56cdccc088212f1a385372c16325'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [flareCoston2]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
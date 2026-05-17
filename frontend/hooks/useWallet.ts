'use client'

import { useState, useEffect, useCallback } from 'react'
import { BrowserProvider, formatEther } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletState {
  address: string | null
  chainId: number | null
  balance: string
  isConnected: boolean
  isCorrectNetwork: boolean
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    balance: '0',
    isConnected: false,
    isCorrectNetwork: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const SEPOLIA_CHAIN_ID = 11155111

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return

    try {
      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.listAccounts()

      if (accounts.length > 0) {
        const network = await provider.getNetwork()
        const balance = await provider.getBalance(accounts[0].address)
        const chainId = Number(network.chainId)

        setWallet({
          address: accounts[0].address,
          chainId,
          balance: formatEther(balance),
          isConnected: true,
          isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
        })
      }
    } catch (err) {
      console.error('Wallet check failed:', err)
    }
  }, [])

  useEffect(() => {
    const handleChainChanged = () => window.location.reload()

    checkConnection().finally(() => {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', checkConnection)
        window.ethereum.on('chainChanged', handleChainChanged)
      }
    })

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkConnection)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [checkConnection])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('Metamask tidak terdeteksi. Install Metamask terlebih dahulu.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const provider = new BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(accounts[0])
      const chainId = Number(network.chainId)

      setWallet({
        address: accounts[0],
        chainId,
        balance: formatEther(balance),
        isConnected: true,
        isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
      })
    } catch (err: any) {
      setError(err.message || 'Gagal connect wallet')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      chainId: null,
      balance: '0',
      isConnected: false,
      isCorrectNetwork: false,
    })
  }, [])

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
      })
    } catch (err: any) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        })
      }
    }
  }, [])

  return {
    wallet,
    isLoading,
    error,
    connect,
    disconnect,
    switchToSepolia,
    checkConnection,
  }
}

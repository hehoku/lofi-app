import { useState, useEffect } from 'react'
import './App.css'
// import abi from './utils/Lofi.json'

function App () {
  const [currentAccount, setCurrentAccount] = useState('')
  // const contractAddress = '0x2cc4dc6c1dd61fcf18b34083dee281c61b91a00c'
  // const contractABI = abi.abi

  // check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Make sure you have meatmask wallet installed')
        return
      } else {
        console.log('we have the ethereum object', ethereum)
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]
        setCurrentAccount(account)
        console.log('found an ahuthorized account:', account)
      } else {
        console.log('no authorized account found')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert('Make sure you have meatmask wallet installed')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('connected account', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className='flex flex-col items-center w-8/12'>
      <h1 className='my-10 text-3xl font-bold underline'>Hello world!</h1>
      {currentAccount ? null : (
        <button
          className='w-3/6 bg-blue-600 p-4 rounded-md text-white text-lg font-medium'
          onClick={connectWallet}
        >
          {' '}
          Connect Wallet
        </button>
      )}
    </div>
  )
}

export default App

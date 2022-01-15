import { useState, useEffect } from 'react'
import './App.css'
import { ethers } from 'ethers'
import abi from './utils/Lofi.json'

function App () {
  const [currentAccount, setCurrentAccount] = useState('')
  const [lofiInputValue, setLofiInputValue] = useState('')
  const contractAddress = '0x1e7d0f40219591e1bd149994c802e6261d2c07e5'
  const contractABI = abi.abi

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

  const formatAddress = address => {
    return (
      address.substring(0, 6) + '...' + address.substring(address.length - 4)
    )
  }

  const handleSubmit = async () => {
    console.log(lofiInputValue)
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const lofiContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const submitLofiTxn = await lofiContract.newLofi(lofiInputValue)
        console.log('submitting...', submitLofiTxn.hash)
        await submitLofiTxn.wait()
        console.log('submitted', submitLofiTxn.hash)

        // const allLofis = await lofiContract.getAllLofis()
        // console.log(allLofis)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getLofis = async () => {
    const { ethereum } = window
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const lofiContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        const allLofis = await lofiContract.getAllLofis()
        console.log(allLofis)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className='flex flex-col items-center w-8/12'>
      <h1 className='text-xl font-bold'>Hi, {formatAddress(currentAccount)}</h1>
      {currentAccount ? null : (
        <button
          className='w-3/6 bg-blue-600 p-4 rounded-md text-white text-lg font-medium'
          onClick={connectWallet}
        >
          {' '}
          Connect Wallet
        </button>
      )}
      <input
        className='focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-10 ring-1 ring-slate-200 shadow-sm'
        type='text'
        value={lofiInputValue}
        onChange={e => setLofiInputValue(e.target.value)}
        aria-label='submit lofi song'
        placeholder='Submit your favorite lofi song'
      />
      <button
        onClick={getLofis}
        className='text-base font-medium rounded-lg p-3 bg-blue-300'
      >
        Submit
      </button>
    </div>
  )
}

export default App

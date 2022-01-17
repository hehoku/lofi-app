import { useState, useEffect } from 'react'
import './App.css'
import { ethers } from 'ethers'
import abi from './utils/Lofi.json'
import Spotify from 'react-spotify-embed'

function App () {
  const [currentAccount, setCurrentAccount] = useState('')
  const [lofiInputValue, setLofiInputValue] = useState('')
  const [lofis, setLofis] = useState([])
  const contractAddress = '0xfaeef3203051a918d9d087ff13c1df792a238cc7'
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
        await getLofis()
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
      await getLofis()
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

        const submitLofiTxn = await lofiContract.newLofi(lofiInputValue.trim())
        console.log('submitting...', submitLofiTxn.hash)
        await submitLofiTxn.wait()
        console.log('submitted', submitLofiTxn.hash)

        await getLofis()
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
        setLofis(allLofis)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className='flex flex-col items-center w-8/12 m-auto'>
      <h1 className='text-xl font-bold'>
        Hi,{' '}
        {currentAccount
          ? formatAddress(currentAccount)
          : 'Connect your wallet first'}
      </h1>
      {currentAccount ? (
        <div className='flex flex-col w-full items-center'>
          <input
            className='w-1/2 m-6 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-10 ring-1 ring-slate-200 shadow-sm'
            type='text'
            value={lofiInputValue}
            onChange={e => setLofiInputValue(e.target.value)}
            aria-label='submit lofi song'
            placeholder='Submit your favorite lofi song'
          />
          <button
            onClick={handleSubmit}
            className='w-1/5 text-base font-medium rounded-lg p-3 bg-blue-300'
          >
            Submit
          </button>
        </div>
      ) : (
        <button
          className='w-3/6 bg-blue-600 p-4 mt-10 rounded-md text-white text-lg font-medium'
          onClick={connectWallet}
        >
          {' '}
          Connect Wallet
        </button>
      )}
      {/* show lofis */}
      <div className='flex flex-row content-center mt-10'>
        <Lofis lofis={lofis} />
      </div>
    </div>
  )
}

const Lofis = ({ lofis }) => {
  return (
    lofis.length > 0 &&
    lofis.map(lofi => <LofiItem key={lofi.timestamp.toString()} lofi={lofi} />)
  )
}

const LofiItem = ({ lofi }) => {
  function isValidUrl (_string) {
    const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/gm
    return matchpattern.test(_string)
  }

  return (
    <div key={lofi.timestamp.toString()}>
      {isValidUrl(lofi.lofiUrl.trim()) ? (
        <div className='mx-10'>
          <Spotify link={lofi.lofiUrl.trim()} />
        </div>
      ) : null}
    </div>
  )
}

export default App

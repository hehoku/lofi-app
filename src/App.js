import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { ethers } from 'ethers'
import abi from './utils/Lofi.json'
import Spotify from 'react-spotify-embed'

const contractAddress = '0x6afafe9fdc9aa5d729c9fd42c25d68efb3adcbe8'
const contractABI = abi.abi

function App () {
  const [currentAccount, setCurrentAccount] = useState('')
  const [lofiInputValue, setLofiInputValue] = useState('')
  const [lofis, setLofis] = useState([])

  const getLofis = useCallback(async () => {
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
  }, [])

  // check if wallet is connected
  // useCallback is used to prevent re-rendering

  const checkIfWalletIsConnected = useCallback(async () => {
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
  }, [getLofis])

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

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [checkIfWalletIsConnected])

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
      <div className='flex flex-row content-center my-10'>
        <Lofis lofis={lofis} handleGetLofisFromApp={getLofis} />
      </div>
    </div>
  )
}

const Lofis = ({ lofis, handleGetLofisFromApp }) => {
  const handleGetLofis = () => {
    handleGetLofisFromApp()
  }
  return (
    lofis.length > 0 &&
    lofis.map((lofi, index) => (
      <LofiItem
        key={lofi.timestamp.toString()}
        index={index}
        lofi={lofi}
        handleGetLofisFromLofis={handleGetLofis}
      />
    ))
  )
}

const LofiItem = ({ lofi, index, handleGetLofisFromLofis }) => {
  function isValidUrl (string) {
    let url

    try {
      url = new URL(string)
    } catch (_) {
      return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  // handle upvote then get all lofis
  const handleUpvote = async index => {
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

        const upvoteTxn = await lofiContract.upvote(index)
        console.log('upvoting...', upvoteTxn.hash)
        await upvoteTxn.wait()
        console.log('upvoted', upvoteTxn.hash)

        // inform user that upvote was successful
        handleGetLofisFromLofis()
      }
    } catch (error) {
      console.log(error)
    }
  }

  // handle send tip to lofi subimitter
  const handleSendtip = async index => {
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

        const sendTipTxn = await lofiContract.tip(index)
        console.log('sending tip...', sendTipTxn.hash)
        await sendTipTxn.wait()
        console.log('sent tip', sendTipTxn.hash)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div key={lofi.timestamp.toString()}>
      {isValidUrl(lofi.lofiUrl.trim()) ? (
        <div className='mx-10 flex flex-col items-center'>
          <Spotify link={lofi.lofiUrl.trim()} />
          <p>{lofi.submitter}</p>
          <p>upvote count {lofi.upvoteCount.toNumber()}</p>
          <button
            className='btn bg-blue-600 w-40 h-12 text-white rounded-lg my-4'
            onClick={handleUpvote.bind(this, index)}
          >
            Upvote
          </button>
          <button
            className='btn bg-blue-600 w-40 h-12 text-white rounded-lg'
            onClick={handleSendtip.bind(this, lofi.submitter)}
          >
            Send tip
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default App

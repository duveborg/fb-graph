import Head from 'next/head'
import styles from '../styles/Home.module.css'
import useSWR from 'swr'
import React from 'react'
import _ from 'lodash'
import randomColor from 'randomcolor'
import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-moment'

const fetcher = async (url) => {
  const response = await fetch(url)
  return await response.json()
}

export default function Home() {
  const { data } = useSWR('/api/fetch', fetcher)

  if (!data) return "Loading"

  const groupedByTitle = _.groupBy(data.data, 'title')
  const datasets = _.map(groupedByTitle, (values, title) => {
    const color = randomColor({ seed: title })
    const currentReaders = _.last(values).readers
    return {
      label: title + " (" + currentReaders + ")",
      backgroundColor: color,
      borderColor: color,
      data: values.map(value => ({
        y: value.readers,
        x: value.time['@ts']
      }))
    }
  })

  const chartData = {
    datasets
  }

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'DD/MM HH:mm'
          }
        }
      },
    },
    plugins: {
      title: {
        text: 'Populära trådar på flashback.org',
        display: true
      },
      legend: {
        position: 'bottom'
      }
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Populära flashbacktrådar över tid </title>
        <meta name="description" content="Populära flashbacktrådar över tid" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Line data={chartData} options={options} />

    </div>
  )
}

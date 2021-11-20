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

  const grouped = _.groupBy(data.data, 'link')
  let datasets = _.map(grouped, (values) => {
    const title = values[0].title
    const color = randomColor({ seed: title })
    const last = _.first(values)
    return {
      label: title + " (" + last.readers + ")",
      backgroundColor: color,
      borderColor: color,
      lastValue: last,
      data: values.map(value => ({
        y: value.readers,
        x: value.time['@ts'],
      }))
    }
  })

  datasets = datasets.sort((a, b) => b.lastValue.readers - a.lastValue.readers)

  const chartData = {
    datasets
  }

  const options = {
    onClick(e, element) {
      if (!element.length) return
      const item = datasets[element[0].datasetIndex].lastValue;
      window.open('https://www.flashback.org/' + item.link, '_blank').focus();
    },
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

      <Line height="200" data={chartData} options={options} />

    </div>
  )
}

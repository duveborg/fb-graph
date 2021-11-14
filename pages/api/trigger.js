
import faunadb, { query as q } from 'faunadb'
import Cheerio from 'cheerio'
import axios from 'axios'
import * as iso88592 from 'iso-8859-2';

const { FAUNA_ADMIN_KEY: secret } = process.env

const client = new faunadb.Client({ secret })

const onlyNumbers = str => parseInt(str.replace(/\s/g, ''))

const fetchHtml = async () => {
  try {
    const request = await axios.request({
      method: 'GET',
      url: 'https://google.com',
      //url: 'https://www.flashback.org/aktuella-amnen',
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      timeout: 7000
    });
  
    const html = iso88592.decode(request.data.toString('binary'));
    console.log('html')
    return html
  } catch(error) {
    console.error(error)
    console.log('got error', error.message)
    return null
  }
}

export default async function handler(req, res) {

  const html = await fetchHtml()
  const $ = Cheerio.load(html)

  const items = []
  $("tr").map((_, row) => {
    const content = $(row).find('.text-muted.visible-xs').text()
    const link = $(row).find('a').attr('href')
    const title = $(row).find('.thread-title').text()
    const [views, readers, replies] = content.split('•')

    items.push({
      time: q.Now(),
      readers: onlyNumbers(readers),
      views: onlyNumbers(views),
      link,
      title,
      replies: onlyNumbers(replies)
    })
  })

  const popularItems = items.filter(item => item.readers > 100)

  const response = await client.query(q.Map(
    popularItems,
    q.Lambda(
      'item',
      q.Create(
        q.Collection('items'),
        { data: q.Var('item') },
      )
    ),
  ))

  res.status(200).json({ result: 'Saved this many items: ' + popularItems.length })
}



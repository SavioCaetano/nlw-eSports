// HTTP METHODS / API RESTful
// GET, POST, PUT (edição geral), PATCH (edição singular, específica), DELETE
/* HTTP Codes (200, 300, 400, 500)
 - Iniciados em 2: Status de sucesso
 - Iniciados em 3: Redirecionamento
 - Iniciados em 4: Erros gerados pela aplicação
 - Iniciados em 5: Erros inesperados
*/

/** Tipos de Parâmetros
 * Query: São nomeados e vêm através do "?". Usado para persistir estado => Ex: localhost:8000/ads?page=2&sort=title
 * Route: Reconhecidos intrícicamente. Usado para idêntificação de recurso => Ex: localhost:8000/ads/5
 * Body: Enviar várias informações em uma requisição (forms).
 */

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { converHourStringToMinutes } from './utils/convert-hour-string-to-minutes';
import { converMinutesToHourString } from './utils/convert-minutes-to-hour-string';

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();


app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    });
    
    return response.json(games);
});

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: converHourStringToMinutes(body.hourStart),
            hourEnd: converHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    });

    return response.status(201).json(ad);
});

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            yearsPlaying: true,
            weekDays: true,
            hourStart: true,
            hourEnd: true,
            useVoiceChannel: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc',
        }
    });

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: converMinutesToHourString(ad.hourStart),
            hourEnd: converMinutesToHourString(ad.hourEnd),
        }
    }));
});

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    });

    return response.json({
        discord: ad.discord,
    })
});


app.listen(8000);
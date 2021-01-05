import React from 'react'
import {
  Text,
  BoxProps,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react'
import { useGitRowsGet } from 'src/hooks/useGitRows'
import dayjs from 'dayjs'

export interface Stats {
  total: number
  last24h: number
  prev24h: number
  today: number
  yesterday: number
}

export interface StatsProps extends BoxProps, Stats {}

export const Stats: React.FC<StatsProps> = ({
  total,
  last24h,
  prev24h,
  today,
  yesterday,
  ...props
}) => {
  const last24hPct =
    prev24h === 0 ? 0 : Math.round((100 * (last24h - prev24h)) / prev24h)
  const todayPct =
    yesterday === 0 ? 0 : Math.round((100 * (today - yesterday)) / yesterday)
  return (
    <StatGroup {...props}>
      <Stat flex={2} ml={2}>
        <StatLabel>Links Posted</StatLabel>
        <StatNumber fontSize="4xl">{formatStatNumber(total)}</StatNumber>
      </Stat>
      <Stat textAlign="center">
        <StatLabel>Last 24h</StatLabel>
        <StatNumber>{formatStatNumber(last24h)}</StatNumber>
        {last24hPct !== 0 && (
          <StatHelpText
            fontSize="xs"
            color={last24hPct > 0 ? 'green.400' : 'red.400'}
          >
            <StatArrow type={last24hPct > 0 ? 'increase' : 'decrease'} />
            {formatStatNumber(last24hPct, {
              signDisplay: 'exceptZero',
            })}
            %{' '}
            <Text as="span" color="gray.400">
              ({prev24h})
            </Text>
          </StatHelpText>
        )}
      </Stat>
      <Stat textAlign="center">
        <StatLabel>Today</StatLabel>
        <StatNumber>{formatStatNumber(today)}</StatNumber>
        {todayPct !== 0 && (
          <StatHelpText
            fontSize="xs"
            color={todayPct > 0 ? 'green.400' : 'red.400'}
          >
            <StatArrow type={todayPct > 0 ? 'increase' : 'decrease'} />
            {formatStatNumber(todayPct, {
              signDisplay: 'exceptZero',
            })}
            %{' '}
            <Text as="span" color="gray.400">
              ({yesterday})
            </Text>
          </StatHelpText>
        )}
      </Stat>
    </StatGroup>
  )
}

// --

export function formatStatNumber(
  number: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return number.toLocaleString('en-GB', {
    notation: 'compact',
    unitDisplay: 'short',
    ...options,
  })
}

// --

export function useStats() {
  const [stats, setStats] = React.useState<Stats>({
    total: 0,
    last24h: 0,
    prev24h: 0,
    today: 0,
    yesterday: 0,
  })
  const get = useGitRowsGet()
  const update = React.useCallback(async () => {
    const rows = await get()
    const now = dayjs()
    const stats: Stats = {
      total: rows.length,
      last24h: rows.filter(
        (row) => row.timestamp >= now.subtract(24, 'h').valueOf()
      ).length,
      prev24h: rows.filter(
        (row) =>
          row.timestamp >= now.subtract(48, 'h').valueOf() &&
          row.timestamp < now.subtract(24, 'h').valueOf()
      ).length,
      today: rows.filter((row) => row.timestamp >= now.startOf('day').valueOf())
        .length,
      yesterday: rows.filter(
        (row) =>
          row.timestamp >= now.subtract(1, 'day').startOf('day').valueOf() &&
          row.timestamp < now.startOf('day').valueOf()
      ).length,
    }
    setStats(stats)
  }, [get])
  return [stats, update] as const
}

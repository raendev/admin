import React from 'react'

/**
 * insert <wbr> (word break opportunity) tags after specified `breakOn` character (default underscore)
 */
export const WithWBRs: React.FC<{
  word: string,
  breakOn?: string,
}> = ({ word, breakOn = '_' }) => (
  <>
    {word.split(breakOn).map((piece, i) => (
      <React.Fragment key={i}>
        {i !== 0 && <>{breakOn}<wbr /></>}
        {piece}
      </React.Fragment>
    ))}
  </>
)

export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addQuery' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getRecentQueries' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };

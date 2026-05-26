using System.Data;
using System.Globalization;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Laundry.DAL.DbHelper
{
    public sealed class SqlHelper(IConfiguration config)
    {
        private readonly string _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new Exception("Connection string 'DefaultConnection' is missing in appsettings.json");

        public async Task ExecuteAsync(string spName, SqlParameter[] parameters)
        {
            using SqlConnection conn = new(_connectionString);
            using SqlCommand cmd = new(spName, conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<int> ExecuteNonQueryAsync(string commandText, SqlParameter[] parameters, CommandType commandType = CommandType.Text)
        {
            using SqlConnection conn = new(_connectionString);
            using SqlCommand cmd = new(commandText, conn);
            cmd.CommandType = commandType;
            cmd.Parameters.AddRange(parameters);

            await conn.OpenAsync();
            return await cmd.ExecuteNonQueryAsync();
        }

        public async Task<T?> ExecuteScalarAsync<T>(string commandText, SqlParameter[] parameters, CommandType commandType = CommandType.Text)
        {
            using SqlConnection conn = new(_connectionString);
            using SqlCommand cmd = new(commandText, conn);
            cmd.CommandType = commandType;
            cmd.Parameters.AddRange(parameters);

            await conn.OpenAsync();
            var result = await cmd.ExecuteScalarAsync();
            if (result is null || result is DBNull)
                return default;

            var targetType = Nullable.GetUnderlyingType(typeof(T)) ?? typeof(T);

            // Common case: SCOPE_IDENTITY() returns decimal in SQL Server.
            if (targetType == typeof(int))
            {
                var i = Convert.ToInt32(result, CultureInfo.InvariantCulture);
                return (T)(object)i;
            }

            return (T)Convert.ChangeType(result, targetType, CultureInfo.InvariantCulture);
        }

        public async Task<T?> ExecuteSingleAsync<T>(
            string commandText,
            SqlParameter[]? parameters,
            Func<SqlDataReader, T> map,
            CommandType commandType = CommandType.Text)
        {
            using SqlConnection conn = new(_connectionString);
            using SqlCommand cmd = new(commandText, conn) { CommandType = commandType };

            if (parameters is { Length: > 0 })
            {
                cmd.Parameters.AddRange(parameters);
            }

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync(CommandBehavior.SingleRow);
            if (!await reader.ReadAsync())
                return default;

            return map(reader);
        }

        public async Task<List<T>> ExecuteListAsync<T>(
            string commandText,
            SqlParameter[]? parameters,
            Func<SqlDataReader, T> map,
            CommandType commandType = CommandType.Text)
        {
            using SqlConnection conn = new(_connectionString);
            using SqlCommand cmd = new(commandText, conn) { CommandType = commandType };

            if (parameters is { Length: > 0 })
            {
                cmd.Parameters.AddRange(parameters);
            }

            await conn.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();

            var results = new List<T>();
            while (await reader.ReadAsync())
            {
                results.Add(map(reader));
            }

            return results;
        }
    }
}
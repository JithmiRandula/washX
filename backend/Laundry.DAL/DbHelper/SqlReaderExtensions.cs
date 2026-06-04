using Microsoft.Data.SqlClient;

namespace Laundry.DAL.DbHelper;

internal static class SqlReaderExtensions
{
    public static decimal ReadDecimalColumn(SqlDataReader reader, params string[] columnNames)
    {
        foreach (var name in columnNames)
        {
            try
            {
                var ordinal = reader.GetOrdinal(name);
                return reader.IsDBNull(ordinal) ? 0m : reader.GetDecimal(ordinal);
            }
            catch (IndexOutOfRangeException)
            {
                // try next alias
            }
        }

        return 0m;
    }

    public static int ReadIntColumn(SqlDataReader reader, params string[] columnNames)
    {
        foreach (var name in columnNames)
        {
            try
            {
                var ordinal = reader.GetOrdinal(name);
                return reader.IsDBNull(ordinal) ? 0 : reader.GetInt32(ordinal);
            }
            catch (IndexOutOfRangeException)
            {
            }
        }

        return 0;
    }

    public static bool? ReadBoolColumn(SqlDataReader reader, string columnName)
    {
        try
        {
            var ordinal = reader.GetOrdinal(columnName);
            return reader.IsDBNull(ordinal) ? null : reader.GetBoolean(ordinal);
        }
        catch (IndexOutOfRangeException)
        {
            return null;
        }
    }

    public static bool HasColumn(this SqlDataReader reader, string columnName)
    {
        for (var i = 0; i < reader.FieldCount; i++)
        {
            if (reader.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                return true;
        }

        return false;
    }
}

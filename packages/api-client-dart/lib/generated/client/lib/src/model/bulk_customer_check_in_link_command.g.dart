// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bulk_customer_check_in_link_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BulkCustomerCheckInLinkCommand extends BulkCustomerCheckInLinkCommand {
  @override
  final BuiltSet<String>? bookingIds;

  factory _$BulkCustomerCheckInLinkCommand([
    void Function(BulkCustomerCheckInLinkCommandBuilder)? updates,
  ]) => (BulkCustomerCheckInLinkCommandBuilder()..update(updates))._build();

  _$BulkCustomerCheckInLinkCommand._({this.bookingIds}) : super._();
  @override
  BulkCustomerCheckInLinkCommand rebuild(
    void Function(BulkCustomerCheckInLinkCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BulkCustomerCheckInLinkCommandBuilder toBuilder() =>
      BulkCustomerCheckInLinkCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BulkCustomerCheckInLinkCommand &&
        bookingIds == other.bookingIds;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, bookingIds.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'BulkCustomerCheckInLinkCommand',
    )..add('bookingIds', bookingIds)).toString();
  }
}

class BulkCustomerCheckInLinkCommandBuilder
    implements
        Builder<
          BulkCustomerCheckInLinkCommand,
          BulkCustomerCheckInLinkCommandBuilder
        > {
  _$BulkCustomerCheckInLinkCommand? _$v;

  SetBuilder<String>? _bookingIds;
  SetBuilder<String> get bookingIds =>
      _$this._bookingIds ??= SetBuilder<String>();
  set bookingIds(SetBuilder<String>? bookingIds) =>
      _$this._bookingIds = bookingIds;

  BulkCustomerCheckInLinkCommandBuilder() {
    BulkCustomerCheckInLinkCommand._defaults(this);
  }

  BulkCustomerCheckInLinkCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _bookingIds = $v.bookingIds?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BulkCustomerCheckInLinkCommand other) {
    _$v = other as _$BulkCustomerCheckInLinkCommand;
  }

  @override
  void update(void Function(BulkCustomerCheckInLinkCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BulkCustomerCheckInLinkCommand build() => _build();

  _$BulkCustomerCheckInLinkCommand _build() {
    _$BulkCustomerCheckInLinkCommand _$result;
    try {
      _$result =
          _$v ??
          _$BulkCustomerCheckInLinkCommand._(bookingIds: _bookingIds?.build());
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'bookingIds';
        _bookingIds?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'BulkCustomerCheckInLinkCommand',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'issue_customer_check_in_link_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$IssueCustomerCheckInLinkCommand
    extends IssueCustomerCheckInLinkCommand {
  @override
  final int expectedVersion;

  factory _$IssueCustomerCheckInLinkCommand([
    void Function(IssueCustomerCheckInLinkCommandBuilder)? updates,
  ]) => (IssueCustomerCheckInLinkCommandBuilder()..update(updates))._build();

  _$IssueCustomerCheckInLinkCommand._({required this.expectedVersion})
    : super._();
  @override
  IssueCustomerCheckInLinkCommand rebuild(
    void Function(IssueCustomerCheckInLinkCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IssueCustomerCheckInLinkCommandBuilder toBuilder() =>
      IssueCustomerCheckInLinkCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IssueCustomerCheckInLinkCommand &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'IssueCustomerCheckInLinkCommand',
    )..add('expectedVersion', expectedVersion)).toString();
  }
}

class IssueCustomerCheckInLinkCommandBuilder
    implements
        Builder<
          IssueCustomerCheckInLinkCommand,
          IssueCustomerCheckInLinkCommandBuilder
        > {
  _$IssueCustomerCheckInLinkCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  IssueCustomerCheckInLinkCommandBuilder() {
    IssueCustomerCheckInLinkCommand._defaults(this);
  }

  IssueCustomerCheckInLinkCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IssueCustomerCheckInLinkCommand other) {
    _$v = other as _$IssueCustomerCheckInLinkCommand;
  }

  @override
  void update(void Function(IssueCustomerCheckInLinkCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  IssueCustomerCheckInLinkCommand build() => _build();

  _$IssueCustomerCheckInLinkCommand _build() {
    final _$result =
        _$v ??
        _$IssueCustomerCheckInLinkCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'IssueCustomerCheckInLinkCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint

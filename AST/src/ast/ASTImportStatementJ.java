package ast;
/**
 * @author GAO RISHENG A0101891L
 * this class is mainly in charge of syntax generation of import statement in Java Programs
 */
public final class ASTImportStatementJ extends ASTImportStatement{
	public ASTImportStatementJ(ASTExpression p) {
		super(p);
		
	}
	public String toSyntax(){
		this.result = "import ";
		this.result += this.packageName.toSyntax();
		this.result += ";\n";
		return this.result;
	}
}
